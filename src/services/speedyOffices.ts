import type { MapOffice, SpeedyOffice } from '@types'

export const SPEEDY_API_URL = 'https://api.speedy.bg/v1/location/office'
const TTL = 60 * 60 * 1000 // 1 hour

let cache: { offices: MapOffice[]; timestamp: number } | null = null

const fetchOfficesFromApi = async (): Promise<MapOffice[]> => {
  const username = import.meta.env.SPEEDY_USERNAME
  const password = import.meta.env.SPEEDY_PASSWORD

  const response = await fetch(SPEEDY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName: username,
      password: password,
      countryId: 100,
    }),
  })

  if (!response.ok) {
    console.error('Speedy API error:', response.status, await response.text())
    return []
  }

  const data: { offices?: SpeedyOffice[] } = await response.json()
  return (data.offices ?? [])
    .map((office) => {
      return {
        id: office.id,
        name: office.name ?? '',
        nameEn: office.nameEn ?? '',
        address: office.address?.fullAddressString ?? '',
        addressEn: office.address?.fullAddressStringEn ?? '',
        lat: office.address?.y ?? null,
        lng: office.address?.x ?? null,
        type: office.type ?? '',
        workingTimeFrom: office.workingTimeFrom ?? null,
        workingTimeTo: office.workingTimeTo ?? null,
        workingTimeHalfFrom: office.workingTimeHalfFrom ?? null,
        workingTimeHalfTo: office.workingTimeHalfTo ?? null,
      }
    })
    .filter((office): office is MapOffice => {
      return office.lat !== null && office.lng !== null
    })
}

export const getCachedOffices = async (): Promise<MapOffice[]> => {
  if (cache && Date.now() - cache.timestamp < TTL) {
    return cache.offices
  }

  try {
    const offices = await fetchOfficesFromApi()
    cache = { offices, timestamp: Date.now() }
    return offices
  } catch (error) {
    console.error('Speedy fetchAllOffices failed:', error)
    return cache?.offices ?? []
  }
}
