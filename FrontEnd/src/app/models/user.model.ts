import { Place } from './place.model';
import { Review } from './review.model';
import { Travel } from './travel.model';
import { environment } from '../../environments/environment';

export class User {

  constructor( public uid: string,
               public rol: string,
               public name?: string,
               public networks?: string,
               public email?: string,
               public registerDate?: Date,
               public active?: Boolean,
               public picture?: string,
               public commercePlace?: Place[],
               public favorites?: Place[],
               public reviews?: Review[],
               public travels?: Travel[],
               public activation_code?:string,
               public CIF?: string,
               public exists: boolean = false
               ) {}

               get imagenUrl(): string {
                // Devolvemos la imagen en forma de peticilon a la API
                const token = localStorage.getItem('x-token') || '';
                if (!this.picture) {
                    return `${environment.base_url}/upload/fotoperfil/no-imagen?token=${token}`;
                }
                return `${environment.base_url}/upload/fotoperfil/${this.picture}?token=${token}`;
            }

}
