import { User } from './user.model';
import { Place } from './place.model';

export class Review {

  constructor( //cambiar opciones
      public uid: string,
      public comment?: string,
      public review?: number,
      public pictures?: string[],
      public like?: number,
      public publicationDate?: Date,
      public place?: Place,
      public user?: User,
  )
  {}

}
