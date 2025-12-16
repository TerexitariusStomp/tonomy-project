#include <eosio/tester.hpp>
#include <invitono.hpp>

using namespace eosio;
using namespace eosio::native;

EOSIO_TEST_BEGIN(invite_limits_and_rewards)
{
   tester chain;
   chain.create_account("invite.cxc"_n);
   chain.create_account("alice"_n);
   chain.create_account("bob"_n);
   chain.create_account("carol"_n);
   chain.create_account("token.cxc"_n);
   chain.create_account("verifier"_n);

   // Mock reward symbol BLUX
   symbol blux = symbol{"BLUX", 4};
   std::vector<asset> tiers = {
      asset{10000, blux},
      asset{5000, blux},
      asset{2500, blux},
      asset{1250, blux},
   };

   chain.set_code("invite.cxc"_n, "invitono.wasm"_n);
   chain.set_abi("invite.cxc"_n, "invitono.abi"_n);

   // init
   chain.push_action(
      "invite.cxc"_n, "init"_n, "invite.cxc"_n,
      std::make_tuple("invite.cxc"_n, "token.cxc"_n, blux, 5u, 180u, time_point_sec(current_time_point()),
                      tiers, 1ull, "verifier"_n));

   // setverify for accounts (oracle signer)
   chain.push_action("invite.cxc"_n, "setverify"_n, "verifier"_n, std::make_tuple("alice"_n, 1ull));
   chain.push_action("invite.cxc"_n, "setverify"_n, "verifier"_n, std::make_tuple("bob"_n, 1ull));

   // alice invites bob (should succeed)
   chain.push_action("invite.cxc"_n, "sendinvite"_n, "alice"_n, std::make_tuple("alice"_n, "bob"_n));

   // alice daily limit enforcement (5 invites)
   chain.create_account("u1"_n);
   chain.create_account("u2"_n);
   chain.create_account("u3"_n);
   chain.create_account("u4"_n);
   chain.create_account("u5"_n);
   chain.create_account("u6"_n);
   for (auto acc : {"u1"_n, "u2"_n, "u3"_n, "u4"_n, "u5"_n}) {
      chain.push_action("invite.cxc"_n, "setverify"_n, "verifier"_n, std::make_tuple(name{acc}, 1ull));
      chain.push_action("invite.cxc"_n, "sendinvite"_n, "alice"_n, std::make_tuple("alice"_n, name{acc}));
   }
   // sixth should fail
   EOSIO_CHECK_ASSERT(
      "Daily invite limit reached",
      chain.push_action("invite.cxc"_n, "sendinvite"_n, "alice"_n, std::make_tuple("alice"_n, "u6"_n)));

   // upvote claim resets daily
   chain.push_action("invite.cxc"_n, "claimdaily"_n, "alice"_n, std::make_tuple("alice"_n));
   auto ups = chain.get_table<invitono::upvote_alloc>("invite.cxc"_n, "invite.cxc"_n.value, "upvotes"_n);
   eosio::check(!ups.empty(), "upvotes record missing");
}
EOSIO_TEST_END

int main(int argc, char** argv) {
   EOSIO_TEST(invite_limits_and_rewards);
   return has_failed();
}
