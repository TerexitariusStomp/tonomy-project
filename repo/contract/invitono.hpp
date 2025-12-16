#pragma once

#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>
#include <eosio/singleton.hpp>
#include <eosio/time.hpp>
#include <vector>

using namespace eosio;
using std::vector;

class [[eosio::contract("invitono")]] invitono : public contract {
public:
    using contract::contract;

    // lifecycle/config
    ACTION init(name admin,
                name token_contract,
                symbol reward_symbol,
                uint32_t daily_limit,
                uint32_t campaign_days,
                time_point_sec campaign_start,
                vector<asset> tier_rewards,
                uint64_t min_verification_level,
                name verifier);
    ACTION setconfig(name admin,
                     uint32_t daily_limit,
                     uint32_t campaign_days,
                     time_point_sec campaign_start,
                     vector<asset> tier_rewards,
                     bool active,
                     uint64_t min_verification_level,
                     name verifier);

    // invite flow
    ACTION sendinvite(name inviter, name invited);
    ACTION resetdaily(name user);
    ACTION setverify(name user, uint64_t level);
    ACTION claimreward(name user); // compatibility; rewards are distributed instantly
    ACTION updatestats(name user);

    // upvote allocation
    ACTION claimdaily(name user);

    // data structures
    struct [[eosio::table]] invite_record {
        name inviter;
        name invited;
        time_point timestamp;
        uint64_t tier = 1;
        asset rewards_earned;
        uint64_t primary_key() const { return invited.value; }
        uint64_t by_inviter() const { return inviter.value; }
    };

    struct [[eosio::table]] user_stats {
        name username;
        uint32_t direct_invites = 0;
        uint32_t total_downstream = 0;
        asset total_rewards = asset{0, symbol{"BLUX", 4}};
        time_point last_invite;
        uint32_t daily_invites_used = 0;
        uint64_t verification_level = 0;
        uint64_t primary_key() const { return username.value; }
    };

    struct [[eosio::table]] invite_config {
        uint32_t daily_invite_limit = 5;
        uint32_t campaign_duration_days = 180;
        time_point campaign_start;
        time_point campaign_end;
    vector<asset> tier_rewards;
    bool campaign_active = false;
    uint64_t min_verification_level = 1;
    name token_contract;
    symbol reward_symbol;
    name admin;
    name verifier;
  };

    struct [[eosio::table]] upvote_alloc {
        name user;
        uint64_t verification_level = 0;
        uint32_t daily_upvotes = 0;
        uint32_t upvotes_used_today = 0;
        time_point last_reset;
        uint64_t primary_key() const { return user.value; }
    };

    using invites_table = multi_index<"invites"_n, invite_record,
        indexed_by<"byinviter"_n, const_mem_fun<invite_record, uint64_t, &invite_record::by_inviter>>>;
    using stats_table = multi_index<"userstats"_n, user_stats>;
    using config_singleton = singleton<"config"_n, invite_config>;
    using upvote_table = multi_index<"upvotes"_n, upvote_alloc>;

private:
    static constexpr uint32_t max_depth = 4;
    static constexpr uint32_t seconds_per_day = 86400;

    uint64_t get_verification_level(const name& user);
    void require_verified(const name& user, uint64_t min_level);
    void distribute_tetrahedral_rewards(const name& inviter, const name& invited, const invite_config& cfg);
    void touch_user_stats(const name& user);
    void reset_invite_window(stats_table& stats, stats_table::iterator itr, const invite_config& cfg, time_point now);
    uint32_t calculate_daily_upvotes(uint64_t verification_level) const;
    invite_config get_config() const;
};
