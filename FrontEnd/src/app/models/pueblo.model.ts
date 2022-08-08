import { Place } from "./place.model";
import { Event } from "./event.model";

export class Pueblo {

  constructor( public uid: string,
               public name?: string,
               public location?: string,
               public pictures?: string[],
               public surface?: string,
               public description?: string,
               public population?: number,
               public tags?: any[],
               public visits?: number,
               public province?:any,
               public places?: Place[],
               public events?: Event[]
               ) {}

}
