export default function Logo({small=false}:{small?:boolean}){
  return (
    <div className={'brand '+(small?'small':'')}>
      <img className="brand-logo-image" src="/travel-story-logo.jpeg" alt="Travel Story" />
    </div>
  )
}
