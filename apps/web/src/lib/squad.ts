export type SquadPhoto = {
  src: string;
  name: string;
  alt: string;
};

/** Bump when squad assets change so Next/CDN caches refresh. */
const SQUAD_ASSET_V = "black-bg-v2";

function squadSrc(file: string) {
  return `/squad/united-tigers/${file}?v=${SQUAD_ASSET_V}`;
}

/** United Tigers squad kit photography — separate from product gallery images. */
export const UNITED_TIGERS_SQUAD: SquadPhoto[] = [
  {
    src: squadSrc("01-fakhar-zaman.jpg"),
    name: "Fakhar Zaman",
    alt: "Fakhar Zaman in United Tigers match kit",
  },
  {
    src: squadSrc("02-iftikhar-ahmed.jpg"),
    name: "Iftikhar Ahmed",
    alt: "Iftikhar Ahmed in United Tigers match kit",
  },
  {
    src: squadSrc("03-iftikhar-ahmed-flex.jpg"),
    name: "Iftikhar Ahmed",
    alt: "Iftikhar Ahmed celebrating in United Tigers kit",
  },
  {
    src: squadSrc("04-zeeshan-naseer.jpg"),
    name: "Zeeshan Naseer",
    alt: "Zeeshan Naseer in United Tigers match kit",
  },
  {
    src: squadSrc("05-azmatullah-omarzai.jpg"),
    name: "Azmatullah Omarzai",
    alt: "Azmatullah Omarzai in United Tigers match kit",
  },
  {
    src: squadSrc("06-usman-tariq.jpg"),
    name: "Usman Tariq",
    alt: "Usman Tariq in United Tigers long-sleeve kit",
  },
  {
    src: squadSrc("08-odean-smith.jpg"),
    name: "Odean Smith",
    alt: "Odean Smith in United Tigers match kit",
  },
  {
    src: squadSrc("10-faheem-ashraf.jpg"),
    name: "Faheem Ashraf",
    alt: "Faheem Ashraf in United Tigers match kit",
  },
  {
    src: squadSrc("11-abbas-afridi.jpg"),
    name: "Abbas Afridi",
    alt: "Abbas Afridi in United Tigers match kit",
  },
  {
    src: squadSrc("07-azmatullah-omarzai-ls.jpg"),
    name: "Azmatullah Omarzai",
    alt: "Azmatullah Omarzai in United Tigers long-sleeve kit",
  },
  {
    src: squadSrc("09-faheem-ashraf-ls.jpg"),
    name: "Faheem Ashraf",
    alt: "Faheem Ashraf in United Tigers long-sleeve kit",
  },
];
