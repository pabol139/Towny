import { Review } from "./review.model";

export class Place {

  constructor( public uid: string,
               public name?: string,
               public location?: string,
               public pictures?: string[],
               public mobile_number?: number,
               public description?: string,
               public type?: string,
               public web?: string,
               public media_reviews?: number,
               public schedule?: string,
               public visits?: number [],
               public reviews?: Review [],
               public status?: string,
               public province?:any,
               public town?:any,
               public user?:any
               //public reviews?: Review[]
               ) {}

}
/*
Referencia

name: {
  type: String,
  require: true
},
location: {
  type: String,
  require: true
},
pictures: [{
  picture: {
      type: String,
  }
}],
description: {
  type: String,
},
mobile_number: {
  type: Number,

},
type: {
  type: String,
  require: true

},
web: {
  type: String,

},
schedule: {
  type: String,

},
visits: {
  type: Number,

},
reviews: [{
  review: {
      type: Schema.Types.ObjectId,
      ref: 'Review',

  }
}]
*/
