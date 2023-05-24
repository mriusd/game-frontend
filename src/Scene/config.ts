export const CAMERA_POSITION = [ -6.5, 6.5, 6.5 ] // used for camera, to save distance to object
// export const CAMERA_POSITION = [ 0, 8, 8 ] // for dev
export const DAMAGE_COLORS = {
    ignoreDefence: 0xFFE600,
    excellent: 0x00FF19,
    critical: 0x00F0FF,
    other: 0xFFC940,
    miss: 0xD9D9D9
}
/*
    Damage colors:
    if isIgnoreDefence { light yelow }
    else if isExcellent { light green }
    else if isCritical { light blue }
    else { yellow }
    if double { display twice damage/2 }
*/