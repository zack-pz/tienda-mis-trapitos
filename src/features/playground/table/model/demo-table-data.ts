import { faker } from '@faker-js/faker'

export type Person = {
  id: number
  firstName: string
  lastName: string
  age: number
  visits: number
  progress: number
  status: 'relationship' | 'complicated' | 'single'
  subRows?: Person[]
}

const range = (length: number) => {
  const values: number[] = []

  for (let index = 0; index < length; index += 1) {
    values.push(index)
  }

  return values
}

const newPerson = (num: number): Person => ({
  id: num,
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  age: faker.number.int(40),
  visits: faker.number.int(1000),
  progress: faker.number.int(100),
  status: faker.helpers.arrayElement([
    'relationship',
    'complicated',
    'single',
  ] as const),
})

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const length = lens[depth] ?? 0

    return range(length).map((index): Person => ({
      ...newPerson(index),
      subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
    }))
  }

  return makeDataLevel()
}
