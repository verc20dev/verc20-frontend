import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/react";
import { Link } from "@nextui-org/link";
import { siteConfig } from "@/config/site";


export default function Home() {
  return (
    <section className="flex-col h-full">
      <div className="relative flex h-full items-center">
        <div className="z-10">
          <h2
            className="font-display text-3xl font-black text-white xs:text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl">

            <span className="text-red-400">Revitalizing</span> Ethereum Inscription Trading&nbsp;<br/><br/>
            <span><span className="text-green-500">30%</span> Less Gas Costs</span>&nbsp;<br/>
            <span>Real <span className="text-yellow-400">Fair</span> Mode</span>&nbsp;<br/>
            <span>Heightened <span className="text-blue-800">Security</span></span>&nbsp;
          </h2>
          <div className="mt-8 gap-8">
            <Button
              variant="ghost" radius="sm" size="lg" className="font-bold"
              as={Link}
              showAnchorIcon
              href={siteConfig.links.docs}
              target="_blank"
            >
              Read More
            </Button>
            <Button
              color="primary" radius="sm" size="lg" className="font-bold ml-8"
              as={Link}
              href="/tokens"
            >
              Go to App
            </Button>
          </div>
        </div>
        <div className="block sm:hidden absolute !z-[1]">
          <Image
            width={1000}
            alt="vERC-20 hero Image"
            src="/hero1.png"
            className="!z-1"
          />
        </div>

        <Image
          width={1000}
          alt="vERC-20 hero Image"
          src="/hero1.png"
          className="hidden sm:block animate-test"
        />

      </div>
    </section>
  )
}
