import { get } from "axios";

//const api_key = process.env.API_KEY;

/*export default async function fetchData(city) {
  try {
    const response = await get(
      `https://api.waqi.info/feed/${city}/?token=${api_key}`
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}*/

export default class FetchData {
  constructor(input) {
    this.key = process.env.API_KEY;

    this.city = async function () {
      try {
        const response = await get(
          `https://api.waqi.info/feed/${input}/?token=${this.key}`
        );
        //console.log(response.data);
        return response.data.data;
      } catch (error) {
        console.error(error);
        return error;
      }
    };
    this.geo = async function () {
      try {
        const response = await get(
          `https://api.waqi.info/feed/geo:${input}/?token=${this.key}` // lat; long
        );
        //console.log(response);
        return response.data.data;
      } catch (error) {
        console.error(error);
        return error;
      }
    };
  }
}
