export interface CalificacionMateria {
  clave: string;
  nombre: string;
  calificacion: string;
  claveOportunidad: string; //realmente solo necesitaré la otra probablemente
  oportunidad: string;
  creditos: number;
}
export interface Coordenadas {
  x: number;
  y: number;
}
export interface ReticulaMateria {
  clave: string;
  nombre: string; //nombre de la materia
  coordenadas: Coordenadas;
  c: number; //ni idea
  g: number; //menos idea

  //Se supone que sea una lista de las coordenadas de las materias con las que se seria
  // pero al parecer es una materia con la que se seria
  materiaNecesaria: Coordenadas;
}
