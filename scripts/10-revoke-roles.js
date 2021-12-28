import consts from "./consts.js";
import sdk from "./sdk.js";

const tokenModule = sdk.getTokenModule(consts.tokenModuleAddress);

(async () => {
  try {
    // Log current roles.
    const currentRoles = await tokenModule.getAllRoleMembers();
    console.log("👀 Roles that exist right now:", currentRoles);

    // Revoke all the superpowers your wallet had over the ERC-20 contract.
    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);

    // Log new roles.
    const newRoles = await tokenModule.getAllRoleMembers()
    console.log("🎉 Roles after revoking ourselves:", newRoles);

    console.log("✅ Successfully revoked our superpowers from the ERC-20 contract.");
  } catch (error) {
    console.error("Failed to revoke ourselves from the DAO treasury!", error);
  }
})();
