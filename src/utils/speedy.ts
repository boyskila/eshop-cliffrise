import { SHIPPING_FEE_EUR } from '@constants'

export const calculateShippingFee = async (
  officeId: number,
  totalWeight: number,
): Promise<number> => {
  const userName = import.meta.env.SPEEDY_USERNAME
  const password = import.meta.env.SPEEDY_PASSWORD

  if (!userName || !password) {
    console.error('Speedy credentials not configured, using fallback fee')
    return SHIPPING_FEE_EUR
  }

  try {
    const response = await fetch('https://api.speedy.bg/v1/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName,
        password,
        sender: {
          address: {
            countryId: 100,
            siteId: 68134, // Sofia — siteId is unique; postCode is not unique in Bulgaria
          },
        },
        recipient: {
          privatePerson: true,
          pickupOfficeId: officeId,
        },
        service: {
          autoAdjustPickupDate: true,
          serviceIds: [505],
        },
        content: {
          parcelsCount: 1,
          totalWeight: totalWeight || 1,
        },
        payment: {
          courierServicePayer: 'SENDER',
        },
      }),
    })

    const data = await response.json()

    if (data.error || data.calculations?.[0]?.error) {
      console.error(
        'Speedy calculate error:',
        data.error ?? data.calculations[0].error,
      )
      return SHIPPING_FEE_EUR
    }

    return data.calculations?.[0]?.price?.total ?? SHIPPING_FEE_EUR
  } catch (err) {
    console.error('Speedy API request failed:', err)
    return SHIPPING_FEE_EUR
  }
}
