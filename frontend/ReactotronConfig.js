import Reactotron from "reactotron-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


Reactotron
  .setAsyncStorageHandler(AsyncStorage)
  .configure({ host: "192.168.1.4" }) 
  .useReactNative()
  .connect();

console.tron = Reactotron;


// import Reactotron from "reactotron-react-native";

// const middleware = (tron) => {

// };

// Reactotron.setAsyncStorageHandler(AsyncStorage)
//   .configure({
//     name: "React Native Demo",
//   })
//   .useReactNative() 
//   .use(middleware) 
//   .connect();