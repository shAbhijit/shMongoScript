const { MongoClient, ServerApiVersion } = require('mongodb');
const _ = require("lodash")
const uri = "mongodb+srv://shUser:oUt8ciVlmSQkEg9T@cluster0.xuebsry.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const collection = "product";
const product = "swaggerhub";
const costUnits = "USD";
const staticObj = [{
  "id": "public-templates",
  "name": "Public Templates",
  "type": "RESOURCE_ID",
  "limit": 10000
}, {
  "id": "private-templates",
  "name": "Private Templates",
  "type": "RESOURCE_ID",
  "limit": 10000
}];
const free_v7_id = "Free-V7";
const trial_v7_id = "Trial-V7"
let products = [];
let updateArr = [];

client.connect(async (err) => {
  if (err) { console.log(err); return; }
  let shDb = client.db("shProducts");
  await getProducts(shDb);
  fiterProduct();
  updateProduct(shDb).then((res)=>{
    console.log(res)
    client.close();
  })
});
const getProducts = async (shDb) => {
  products = await shDb.collection(collection).find({ id: product }).toArray();
}
const updateProduct = async (shDb) => {
  let promiseArr = [];
  _.forEach(updateArr, (product) => {
    promiseArr.push(shDb.collection(collection).updateOne({ id: product._id }, { $set: { plans: product.newPlan } }));
  })
  return await Promise.all(promiseArr)
}

const fiterProduct = () => {
  _.forEach(products, product => {
    let plans = product.plans;
    const result = _.map(plans, plan => {
      return _.startsWith(plan.id, 'Trial') || _.startsWith(plan.id, 'Enterprise') ? { ...plan, limits: _.union(plan.limits, staticObj) } : plan
    })
    if (!_.isEqual(plans, result))
      updateArr.push({ _id: product._id, newPlan: result })
  })

}