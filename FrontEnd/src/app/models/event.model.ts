import { Pueblo } from './pueblo.model';

export class Event {

  constructor( //cambiar opciones
      public uid: string,
      public name: string,
      public date: Date,
      public description?: string,
      public pictures?: string[],
      public town?: Pueblo
  )
  {}

}
