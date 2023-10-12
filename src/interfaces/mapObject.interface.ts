export interface Location {
  x: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Scale {
  x: number;
  y: number;
  z: number;
}

export interface MapObject {
  type: string;
  location: Location;
  rotation: Rotation;
  scale: Scale;
}