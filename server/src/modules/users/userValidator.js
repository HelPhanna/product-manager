const { z } = require("zod");
const { ROLES } = require("../../shared/models/User");

exports.updateUserRoleSchema = z.object({
  role: z.enum([ROLES.ADMIN, ROLES.USER], {
    errorMap: () => ({ message: "Role must be 'admin' or 'user'" }),
  }),
});
