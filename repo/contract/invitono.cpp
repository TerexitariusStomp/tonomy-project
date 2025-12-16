#include "invitono.hpp"
#include <eosio/system.hpp>

using std::string;

invite_config invitono::get_config() const {
    config_singleton cfg(get_self(), get_self().value);
    check(cfg.exists(), "Contract not initialized");
    return cfg.get();
}

uint64_t invitono::get_verification_level(const name& user) {
    stats_table stats(get_self(), get_self().value);
    auto itr = stats.find(user.value);
    if (itr == stats.end()) {
        return 0;
    }
    return itr->verification_level;
}

void invitono::require_verified(const name& user, uint64_t min_level) {
    uint64_t level = get_verification_level(user);
    check(level >= min_level, "User does not meet verification requirement");
}

void invitono::touch_user_stats(const name& user) {
    stats_table stats(get_self(), get_self().value);
    auto itr = stats.find(user.value);
    if (itr == stats.end()) {
        auto cfg = get_config();
        stats.emplace(get_self(), [&](auto& row) {
            row.username = user;
            row.total_rewards = asset{0, cfg.reward_symbol};
        });
    }
}

void invitono::reset_invite_window(stats_table& stats, stats_table::iterator itr, const invite_config& cfg, time_point now) {
    if (itr->last_invite.sec_since_epoch() == 0) {
        stats.modify(itr, same_payer, [&](auto& row) {
            row.last_invite = now;
            row.daily_invites_used = 0;
        });
        return;
    }
    auto elapsed = now.sec_since_epoch() - itr->last_invite.sec_since_epoch();
    if (elapsed >= seconds_per_day) {
        stats.modify(itr, same_payer, [&](auto& row) {
            row.last_invite = now;
            row.daily_invites_used = 0;
        });
    }
}

uint32_t invitono::calculate_daily_upvotes(uint64_t verification_level) const {
    switch (verification_level) {
        case 0: return 1;
        case 1: return 5;
        case 2: return 10;
        case 3: return 20;
        case 4: return 50;
        default: return 1;
    }
}

ACTION invitono::init(name admin,
                      name token_contract,
                      symbol reward_symbol,
                      uint32_t daily_limit,
                      uint32_t campaign_days,
                      time_point_sec campaign_start,
                      vector<asset> tier_rewards,
                      uint64_t min_verification_level,
                      name verifier) {
    require_auth(get_self());
    check(is_account(admin), "Admin must exist");
    check(is_account(token_contract), "Token contract must exist");
    check(is_account(verifier), "Verifier must exist");
    check(reward_symbol.is_valid(), "Invalid reward symbol");
    check(daily_limit > 0, "Daily limit must be positive");
    check(!tier_rewards.empty(), "Tier rewards required");
    config_singleton cfg(get_self(), get_self().value);

    invite_config value;
    value.admin = admin;
    value.token_contract = token_contract;
    value.reward_symbol = reward_symbol;
    value.daily_invite_limit = daily_limit;
    value.campaign_duration_days = campaign_days;
    value.campaign_start = time_point(campaign_start);
    value.campaign_end = time_point(campaign_start) + eosio::days(campaign_days);
    value.tier_rewards = tier_rewards;
    value.campaign_active = true;
    value.min_verification_level = min_verification_level;
    value.verifier = verifier;

    cfg.set(value, get_self());
}

ACTION invitono::setconfig(name admin,
                           uint32_t daily_limit,
                           uint32_t campaign_days,
                           time_point_sec campaign_start,
                           vector<asset> tier_rewards,
                           bool active,
                           uint64_t min_verification_level,
                           name verifier) {
    auto cfg = get_config();
    require_auth(cfg.admin);

    check(is_account(admin), "Admin must exist");
    check(is_account(verifier), "Verifier must exist");
    check(daily_limit > 0, "Daily limit must be positive");
    check(!tier_rewards.empty(), "Tier rewards required");

    cfg.admin = admin;
    cfg.daily_invite_limit = daily_limit;
    cfg.campaign_duration_days = campaign_days;
    cfg.campaign_start = time_point(campaign_start);
    cfg.campaign_end = time_point(campaign_start) + eosio::days(campaign_days);
    cfg.tier_rewards = tier_rewards;
    cfg.campaign_active = active;
    cfg.min_verification_level = min_verification_level;
    cfg.verifier = verifier;

    config_singleton table(get_self(), get_self().value);
    table.set(cfg, get_self());
}

ACTION invitono::setverify(name user, uint64_t level) {
    auto cfg = get_config();
    require_auth(cfg.verifier);
    check(is_account(user), "User must exist");

    stats_table stats(get_self(), get_self().value);
    auto itr = stats.find(user.value);
    if (itr == stats.end()) {
        stats.emplace(cfg.admin, [&](auto& row) {
            row.username = user;
            row.verification_level = level;
            row.total_rewards = asset{0, cfg.reward_symbol};
        });
    } else {
        stats.modify(itr, same_payer, [&](auto& row) {
            row.verification_level = level;
        });
    }
}

ACTION invitono::sendinvite(name inviter, name invited) {
    require_auth(inviter);
    auto cfg = get_config();
    auto now = current_time_point();
    check(cfg.campaign_active, "Invite campaign is not active");
    check(now <= cfg.campaign_end, "Campaign has ended");
    check(inviter != invited, "Cannot invite yourself");
    check(is_account(invited), "Invited account does not exist");

    invites_table invites(get_self(), get_self().value);
    check(invites.find(invited.value) == invites.end(), "Invite already recorded for this user");

    stats_table stats(get_self(), get_self().value);
    auto inviter_stats = stats.find(inviter.value);
    if (inviter_stats == stats.end()) {
        stats.emplace(inviter, [&](auto& row) {
            row.username = inviter;
            row.total_rewards = asset{0, cfg.reward_symbol};
            row.last_invite = now;
        });
        inviter_stats = stats.find(inviter.value);
    }

    reset_invite_window(stats, inviter_stats, cfg, now);
    require_verified(inviter, cfg.min_verification_level);
    require_verified(invited, cfg.min_verification_level);
    check(inviter_stats->daily_invites_used < cfg.daily_invite_limit, "Daily invite limit reached");

    invites.emplace(inviter, [&](auto& row) {
        row.inviter = inviter;
        row.invited = invited;
        row.timestamp = now;
        row.tier = 1;
        row.rewards_earned = asset{0, cfg.reward_symbol};
    });

    stats.modify(inviter_stats, same_payer, [&](auto& row) {
        row.direct_invites += 1;
        row.daily_invites_used += 1;
        row.last_invite = now;
    });

    distribute_tetrahedral_rewards(inviter, invited, cfg);
}

void invitono::distribute_tetrahedral_rewards(const name& inviter, const name& invited, const invite_config& cfg) {
    invites_table invites(get_self(), get_self().value);
    stats_table stats(get_self(), get_self().value);

    name current = inviter;
    uint32_t depth = 0;

    while (depth < max_depth && depth < cfg.tier_rewards.size()) {
        auto reward = cfg.tier_rewards[depth];
        check(reward.symbol == cfg.reward_symbol, "Tier reward symbol mismatch");

        auto s_itr = stats.find(current.value);
        if (s_itr == stats.end()) {
            stats.emplace(get_self(), [&](auto& row) {
                row.username = current;
                row.total_rewards = reward;
            });
            s_itr = stats.find(current.value);
        }

        action(
            permission_level{get_self(), "active"_n},
            cfg.token_contract,
            "transfer"_n,
            std::make_tuple(get_self(), current, reward, std::string("Invite reward tier ") + std::to_string(depth + 1))
        ).send();

        stats.modify(s_itr, same_payer, [&](auto& row) {
            row.total_rewards += reward;
            row.total_downstream += 1;
        });

        auto parent = invites.find(current.value);
        if (parent == invites.end()) {
            break;
        }
        current = parent->inviter;
        depth += 1;
    }

    auto invited_stats = stats.find(invited.value);
    if (invited_stats == stats.end()) {
        stats.emplace(get_self(), [&](auto& row) {
            row.username = invited;
            row.total_rewards = asset{0, cfg.reward_symbol};
        });
    }
}

ACTION invitono::claimreward(name user) {
    require_auth(user);
    check(false, "Rewards are distributed immediately on invite");
}

ACTION invitono::resetdaily(name user) {
    require_auth(user);
    stats_table stats(get_self(), get_self().value);
    auto itr = stats.find(user.value);
    check(itr != stats.end(), "User not found");
    stats.modify(itr, same_payer, [&](auto& row) {
        row.daily_invites_used = 0;
        row.last_invite = current_time_point();
    });
}

ACTION invitono::claimdaily(name user) {
    require_auth(user);
    auto cfg = get_config();
    uint64_t level = get_verification_level(user);
    check(level > 0, "Verification required");

    upvote_table ups(get_self(), get_self().value);
    auto itr = ups.find(user.value);
    auto now = current_time_point();

    if (itr != ups.end()) {
        auto elapsed = now.sec_since_epoch() - itr->last_reset.sec_since_epoch();
        check(elapsed >= seconds_per_day, "Already claimed today");
        ups.modify(itr, same_payer, [&](auto& row) {
            row.verification_level = level;
            row.daily_upvotes = calculate_daily_upvotes(level);
            row.upvotes_used_today = 0;
            row.last_reset = now;
        });
    } else {
        ups.emplace(user, [&](auto& row) {
            row.user = user;
            row.verification_level = level;
            row.daily_upvotes = calculate_daily_upvotes(level);
            row.upvotes_used_today = 0;
            row.last_reset = now;
        });
    }
}

ACTION invitono::updatestats(name user) {
    auto cfg = get_config();
    require_auth(cfg.admin);

    invites_table invites(get_self(), get_self().value);
    stats_table stats(get_self(), get_self().value);

    auto s_itr = stats.find(user.value);
    if (s_itr == stats.end()) {
        stats.emplace(cfg.admin, [&](auto& row) {
            row.username = user;
            row.total_rewards = asset{0, cfg.reward_symbol};
        });
        s_itr = stats.find(user.value);
    }

    uint32_t direct = 0;
    uint32_t downstream = 0;

    vector<name> frontier;
    vector<name> next;

    auto idx = invites.get_index<"byinviter"_n>();
    for (auto it = idx.lower_bound(user.value); it != idx.end() && it->inviter == user; ++it) {
        direct += 1;
        downstream += 1;
        frontier.push_back(it->invited);
    }

    for (uint32_t depth = 1; depth < max_depth; ++depth) {
        next.clear();
        for (const auto& current : frontier) {
            for (auto it = idx.lower_bound(current.value); it != idx.end() && it->inviter == current; ++it) {
                downstream += 1;
                next.push_back(it->invited);
            }
        }
        frontier.swap(next);
    }

    stats.modify(s_itr, same_payer, [&](auto& row) {
        row.direct_invites = direct;
        row.total_downstream = downstream;
    });
}
