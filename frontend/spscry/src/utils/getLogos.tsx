import {
  ATL,
  BKN,
  CLE,
  CHA,
  CHI,
  BOS,
  MIA,
  DAL,
  DEN,
  DET,
  GSW,
  HOU,
  IND,
  LAC,
  LAL,
  MEM,
  MIL,
  MIN,
  NOP,
  NYK,
  OKC,
  ORL,
  PHI,
  PHX,
  POR,
  SAC,
  SAS,
  TOR,
  UTA,
  WAS,
} from "react-nba-logos";



export default function returnlogo(name: string): any {
  if (name == "Atlanta Hawks") {
    return <ATL />;
  }
  if (name == "Boston Celtics") {
    return <BOS />;
  }
  if (name == "Brooklyn Nets") {
    return <BKN />;
  }
  if (name == "Chicago Bulls") {
    return (<CHI/>)
  }
  if (name == "Dallas Mavericks") {
    return <DAL />;
  }
  if (name == "Denver Nuggets") {
    return <DEN />;
  }
  if (name == "Detroit Pistons") {
    return <DET />;
  }

  if (name == "Houston Rockets") {
    return <HOU />;
  }

  if (name == "New Orleans Pelicans") {
    return <NOP />;
  }
  if (name == "Milwaukee Bucks") {
    return <MIL />;
  }
  if (name == "Washington Wizards") {
    return <WAS />;
  }

  if (name == "Indiana Pacers") {
    return <IND />;
  }
  if (name == "Los Angeles Lakers") {
    return <LAL />;
  }
  if (name == "Orlando Magic") {
    return <ORL />;
  }
  if (name == "Los Angeles Clippers") {
    return <LAC />;
  }
  if (name == "Utah Jazz") {
    return <UTA />;
  }
  if (name == "San Antonio Spurs") {
    return <SAS/>
  }
  if (name == "New York Knicks"){
    return <NYK/>
  }
  if (name == "Sacramento Kings"){
    return <SAC/>
  }
  if (name == "Miami Heat"){
    return <MIA/>
  }
  if (name == "Charlotte Hornets"){
    return <CHA/>
  }
  if (name == "Golden State Warriors"){
    return <GSW/>
  }
  if (name == "Toronto Raptors"){
    return <TOR/>
  }
  if (name == "Philadelphia 76ers"){
    return <PHI/>
  }
  if (name == "Cleveland Cavaliers"){
    return <CLE/>
  }
  if (name == "Minnesota Timberwolves"){
    return <MIN/>
  }
  if (name == "Oklahoma City Thunder"){
    return <OKC/>
  }
  if (name == "Portland Trail Blazers"){
    return <POR/>
  }
  if (name == "Phoenix Suns"){
    return <PHX/>
  }
  if (name == "Memphis Grizzlies") {
    return <MEM/>
  }
}

