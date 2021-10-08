import { get } from "axios";

export default class FetchData {
  constructor(input) {
    this.key = process.env.API_KEY;

    this.city = async function () {
      try {
        const response = await get(
          `https://api.waqi.info/feed/${input}/?token=${this.key}`
        );
        return response.data.data;
      } catch (error) {
        console.error(error);
        return error;
      }
    };
    this.geo = async function () {
      try {
        const response = await get(
          `https://api.waqi.info/feed/geo:${input}/?token=${this.key}`
        );
        return response.data.data;
      } catch (error) {
        console.error(error);
        return error;
      }
    };
  }
}
