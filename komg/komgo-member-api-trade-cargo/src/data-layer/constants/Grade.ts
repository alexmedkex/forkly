import { Grade } from '@komgo/types'

export class GradeFactory {
  static MAPPING: any = {
    b: Grade.Brent,
    f: Grade.Forties,
    o: Grade.Oseberg,
    e: Grade.Ekofisk,
    t: Grade.Troll
  }

  public static fromCargoId(cargoId: string) {
    const firstLetter = cargoId.toLowerCase().charAt(0)
    return GradeFactory.MAPPING[firstLetter]
  }
}
