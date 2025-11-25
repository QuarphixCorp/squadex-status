/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'
import ServicesSection from "../src/services"
import Logo from "../src/services/components/icons/Logo"

const Home: NextPage = () => {
  return (
    <div className='h-full w-full '>
      <div className="mt-20 absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="w-full h-40 absolute bg-white dark:purple dark:bg-black border-black dark:border-gray-800">
        <div className="sm:ml-0 ml-5 mr-0 mt-3 md:pl-80 md:pr-80 sm:w-full h-full bg-white dark:bg-black flex items-center">
          <Logo width={150} height={100} className="w-40 h-16"/>
        </div>
      </div>
      <div className='mt-20 w-full absolute'>
        <ServicesSection />
      </div >
    </div>
  )
}

export default Home;
