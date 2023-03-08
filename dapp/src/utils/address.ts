//-----------------------------------------------------------------------------------------------//
export const shortAddress = (address: string): string => {
  return address.slice(0, 5) + "..." + address.slice(-3)
}


export const isAddress = (str: any): boolean => {
  if (
    typeof str == "string" &&
    str.length == 42 &&
    str.substring(0, 2) == "0x"
  )
    return true
  else
    return false
}


//-----------------------------------------------------------------------------------------------//