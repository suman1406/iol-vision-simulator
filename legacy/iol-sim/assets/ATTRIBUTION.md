# Scene photographs: sources and licences

Both are real, unedited camera captures. They were chosen because they are sharp, with no motion blur, background bokeh or starburst spikes. Those would build "blur" or "glare" into the scene before any lens is simulated.

## Daytime: `source/day_chicago_taxi_ccby2.jpg`

- **Title:** Chicago (ILL) Downtown, Cab 133 'inside 6'
- **Author:** Vincent Desjardins
- **Source:** https://www.flickr.com/photos/44613506@N07/4824994274 (found via Openverse), downloaded 2026-10-25 at 1024 px
- **Licence:** CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/)
- **Changes:** one number plate blurred, resized to 960 px wide, and split into two depth layers (`layers/day_street.png`, `layers/day_interior.png`).

## Night: `source/night_crete_street_ccbysa4.jpg`

- **Title:** 202610 Driving at night on Crete 01
- **Author:** Jonashtand
- **Source:** https://commons.wikimedia.org/wiki/File:202610_Driving_at_night_on_Crete_01.jpg, downloaded 2026-10-25 at 1280 px
- **Licence:** CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
- **Changes:** number plates blurred, resized to 960 px wide, and a light-source layer extracted (`layers/night_street.png`, `layers/night_lights.png`).
- **Share-alike:** the derived layer images, and any rendered images made from them, are licensed under CC BY-SA 4.0 with this attribution. The application code is a separate work and is not affected.

## Data

- `data/source/Garzon2024_Dataset_Vivity.xlsx`: Garzón N et al., Zenodo, doi 10.5281/zenodo.18084296, licensed CC BY 4.0. It is used unmodified; `tools/extract_vivity.py` derives `data/vivityPowerProfile.js` from it.
- `data/source/FDA_SSED_P930014S126_Vivity.pdf`: US FDA Summary of Safety and Effectiveness Data for PMA P930014/S126 (https://www.accessdata.fda.gov/cdrh_docs/pdf/P930014S126B.pdf). It is a US government work in the public domain, used unmodified; `tools/extract_fda_defocus.py` derives `data/defocusCurves.js` from it.

The app shows each photo's credit under the image, and again in the methodology panel.
