interface GeoData {
  country?: string
  countryCode?: string
  city?: string
  region?: string
}

interface IpApiResponse {
  status: string
  country: string
  countryCode: string
  city: string
  regionName: string
}

export async function getGeoFromIP(ip: string): Promise<GeoData> {
  // Skip for local/private IPs
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
    return {}
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName`, {
      signal: AbortSignal.timeout(3000),
    })
    const data = (await response.json()) as IpApiResponse
    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode,
        city: data.city,
        region: data.regionName,
      }
    }
  } catch {
    // Silently fail — geo is non-critical
  }
  return {}
}
