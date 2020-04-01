export const eqSet = (setA: Set<any>, setB: Set<any>) => {
  return setA.size === setB.size && all(isIn(setB), setA)
}

export const all = (pred: any, setA: any) => {
  for (const a of setA) {
    if (!pred(a)) {
      return false
    }
  }
  return true
}

export const isIn = (setA: Set<any>) => {
  return (a: any) => setA.has(a)
}

export const intersectionOfTwoSets = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  const sizeA = setA.size
  const sizeB = setB.size
  if (setA.size === 0 || setB.size === 0) {
    return new Set()
  }

  let larger: Set<T>
  let smaller: Set<T>

  if (sizeA > sizeB) {
    larger = setA
    smaller = setB
  } else {
    larger = setB
    smaller = setA
  }

  return new Set(Array.from(smaller).filter(el => larger.has(el)))
}
