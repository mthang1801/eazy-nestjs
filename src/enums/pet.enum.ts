export class ICat {
  name: string;
}
export class IDog {
  name: string;
}

export type Pet = ICat | IDog;
