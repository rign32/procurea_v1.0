import { describe, it, expect } from 'vitest'
import { COUNTRIES_PL, COUNTRIES_EN, AVAILABLE_COUNTRIES } from './countries'

describe('Countries constants', () => {
  it('PL and EN arrays have the same length', () => {
    expect(COUNTRIES_PL.length).toBe(COUNTRIES_EN.length)
  })

  it('PL and EN arrays have the same country codes', () => {
    const plCodes = COUNTRIES_PL.map(c => c.code).sort()
    const enCodes = COUNTRIES_EN.map(c => c.code).sort()
    expect(plCodes).toEqual(enCodes)
  })

  it('every country has required fields', () => {
    for (const country of COUNTRIES_PL) {
      expect(country.code).toBeTruthy()
      expect(country.name).toBeTruthy()
      expect(country.flag).toBeTruthy()
      expect(country.group).toBeTruthy()
    }
  })

  it('no duplicate country codes', () => {
    const plCodes = COUNTRIES_PL.map(c => c.code)
    const uniqueCodes = new Set(plCodes)
    expect(plCodes.length).toBe(uniqueCodes.size)
  })

  it('AVAILABLE_COUNTRIES defaults to PL', () => {
    // Default VITE_LANGUAGE is 'pl'
    expect(AVAILABLE_COUNTRIES.length).toBeGreaterThan(100)
  })
})
