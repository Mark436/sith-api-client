import type { ApiAlumno } from "../api/types.js";
import type { Adeudos } from "../dto/Adeudos.js";
import type { Alumno } from "../dto/Alumno.js";
import type { Creditos } from "../dto/Creditos.js";
import { mapBoleta } from "./boleta.mapper.js";
import { mapHorario } from "./horario.mapper.js";

function convertirFechaHermosillo(fecha: string): string {
  return `${fecha.replace(" ", "T")}-07:00`;
}

function hayAdeudos(adeudos: Omit<Adeudos, "tieneAdeudos">): boolean {
  return Object.values(adeudos).some((estado) => estado !== "N");
}

function mapAdeudos(data: ApiAlumno): Adeudos {
  const { abi, aca, aes, afi, ava } = data.infadic;
  const estados = {
    biblioteca: abi,
    academico: aca,
    escolar: aes,
    financiero: afi,
    administrativo: ava,
  };

  return {
    ...estados,
    tieneAdeudos: hayAdeudos(estados),
  };
}

function mapCreditos(data: ApiAlumno): Creditos {
  const { tot, cfa } = data.infadic;

  return {
    totales: Number(tot),
    faltantes: Number(cfa),
  };
}

function calcularProgreso(creditos: Creditos): number {
  if (creditos.totales === 0) {
    return 0;
  }

  return ((creditos.totales - creditos.faltantes) / creditos.totales) * 100;
}

export function mapAlumno(data: ApiAlumno): Alumno {
  const { infadic, banco, correo, telefono, boleta } = data;
  const adeudos = mapAdeudos(data);
  const creditos = mapCreditos(data);

  return {
    numeroControl: banco.mp_order,
    nombre: infadic.nom,
    carrera: infadic.car,
    correo,
    telefono,
    semestre: Number(infadic.sem),
    fechaReinscripcion: convertirFechaHermosillo(infadic.toca),
    promedioGeneral: Number(infadic.prg),
    promedioSemestral: Number(infadic.prs),
    boleta: mapBoleta(boleta),
    adeudos,
    creditos,
    progreso: calcularProgreso(creditos),
    horario: data.gins.map(mapHorario),
  };
}
