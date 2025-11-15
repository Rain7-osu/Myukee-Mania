
export type KeyboardEventHandler = (e: KeyboardEvent) => void

export type BpmList = Array<{ offset: number; value: number }>

export type ContainerProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  background: string;
}
