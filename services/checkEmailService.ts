import axios from "axios";
import crypto from "crypto";

export async function checkPasswordExposure(password: string): Promise<{ exposed: boolean; count: number }> {
  if (!password) return { exposed: false, count: 0 };
  
  const sha1 = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const response = await axios.get(
    `https://api.pwnedpasswords.com/range/${prefix}`
  );

  const hashes = response.data.split("\n");
  const found = hashes.find((h: string) => h.startsWith(suffix));
  const count = found ? parseInt(found.split(":")[1]) : 0;

  return { exposed: !!found, count };
}

export async function checkEmailBreaches(email: string) {
  try {
    const response = await axios.get(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
        timeout: 5000,
      }
    );

    if (response.data?.Error || !response.data?.breaches) return null;

    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    if (err.response?.status === 403) return null;
    throw err;
  }
}