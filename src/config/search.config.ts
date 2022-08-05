export default (): Record<string, any> => ({
  searchNode: process.env.ELASTICSEARCH_NODE,
  searchUser: process.env.ELASTICSEARCH_USERNAME,
  searchPass: process.env.ELASTICSEARCH_PASSWORD,
});
