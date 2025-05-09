export const types = () => `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type ADconfig {
    _id: String!
    createdAt: Date
    modifiedAt: Date
    apiUrl: String
    baseDN: String
    adminDN: String
    adminPassword: String
    code: String
  }
`;

export const queries = `
  adConfigs(code: String): ADconfig
`;

const commonFields = `
  apiUrl: String
  baseDN: String
  adminDN: String
  adminPassword: String
  code: String
`;

export const mutations = `
  adConfigUpdate(${commonFields}): ADconfig
  toCheckAdUsers: JSON
  toSyncAdUsers(action: String, users: [JSON]): JSON
`;
