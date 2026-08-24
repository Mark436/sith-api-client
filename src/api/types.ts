//TODAS LAS DESCRIPCIONES SON TEMPORALES, REALMENTE NO ENTIENDO NADA DE ESTO

export interface ApiInfoAdicional {
  nom: string; //nombre
  car: string; //carrera
  sem: number; //semestre actual
  toca: string; //fecha de reinscripcion
  //promedios
  prg: number; //global
  prs: number; //del semestre
  //creditos en la carrera
  tot: number; //totales
  cfa: number; //pendientes para terminar
  //adeudos
  abi: string; //biblioteca
  aca: string; //academico
  aes: string; //escolar
  afi: string; //financiero
  ava: string; //administrativo (administrativa)

}
export interface ApiMateriaReticula {
  x: number; //coordenadas en x (columna)
  y: number; //coordenadas en y (fila)
  c: number; //ni idea
  g: number; //menos idea
  m: string; //clave de la materia
  t: string; //nombre de la materia
  //Se supone que sea una lista de las coordenadas de las materias con las que se seria
  // pero al parecer es una materia con la que se seria
  r: [[[4, 3]], []]; // no termino de entender por que viene en este formato
}
export interface ApiMateriaInscripcion {
  mat: string; //nombre de la materia
  gbl: string; //ni idea, venia vacío
  cr: number; //cuantos creditos vale la materia
  gpo: string; //grupo de la materia
  mape: string; //apellidos del masestro
  mnom: string; //nombres del masestro
  lu: string; //horas y salon en el día, aplica para todos 'hh:mm-hh:mm GGG\n' Hora Minuto y Grupo si no tiene nada es solo '\n'
  ma: string;
  mi: string;
  ju: string;
  vi: string;
  sa: string;
}
export interface ApiCalificacionMateria {
  clve: string; //clave de la materia
  dmat: string; //nombre de la materia
  cali: string; //Calificacion (es del 70 al 100 tambien esta aprovado y no aprobado para las que no llevan calificacion)  opor: string; // Oportunidad (OO Ordinario OC ordinario complementario etc, no me las se)
  opor: string; //descripcion de la oportunidad si es Ev Ordinaria, Ev Complementaria, etc
  dopor: string; //descripcion de la oportunidad si es Ev Ordinaria, Ev Complementaria, etc
  cr: number; //creditos que vale la materia
}
// type ApiPeriodo = ApiBoleta[];
/**
 * SEGÚN YO ES IGUAL A API PERIODO PERO NO SÉ PORQUE NO TIENE INFORMACIÓN la muestra
 * SUPONGO QUE SON LAS QUE SE ESTAN CURSANDO PERO EL TIPO DEBERIA SER IGUAL
 */
export interface ApiBoleta {
  prom: string; //promedio del periodo
  descPer: string; //Span del periodo
  lcal: ApiCalificacionMateria[]; //lista de las materias de la boleta con calificacion
}
/**
 * Ignorar, no tengo mucha idea y solo puse 1 de los datos
 */
export interface ApiBanco {
  mp_amount: string; //El adeudo actual
  mp_order: string; //Curiosamente es el no Control
}
export interface ApiAlumno {
  tit: string; //no control, nombre y carrera separados por espacios, posible separacion con regex
  // info: string; //creditos (lo estoy buscando en otra parte para ver si es más util los datos por separado)
  correo: string;
  telefono: string;
  ret: ApiMateriaReticula[]; //reticula APARENTEMENTE
  gins: ApiMateriaInscripcion[]; //es como las materias para la inscripción
  infadic: ApiInfoAdicional;
  kdx: ApiBoleta[]; //el kardex deberia tener más información pero al parecer no, si se agrega otra data lo cambio
  boleta: ApiBoleta;
  banco: ApiBanco; //Datos de pagos, no entiendo la velda
}
export interface ApiAviso {
  summary: string; //resumen del mensaje supongo que para el titulo del toast
  detail: string; //Mensaje ya detallado
  severity: string; //Nivel de importancia conocidos: warn, info, error
}
export interface ApiTodo {
  al: ApiAlumno; //informacion del alumno
  lmsg: ApiAviso[]; //Lista de avisos o mensajes
  tkn: string; //token de sesion
}
