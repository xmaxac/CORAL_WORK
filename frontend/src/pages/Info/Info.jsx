import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from '@/components/ui/scroll-area';
import {Button} from "@/components/ui/button"
import { ChevronRight, Download } from 'lucide-react';

const Info = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const speciesList = {
    highlyAffected: [
      { name: "Meandrina meandrites", common: "Maze Coral", role: "Important reef builder providing habitat for fish", image: '/MazeCoral.png' },
      { name: "Dendrogyra cylindrus", common: "Pillar Coral", role: "Creates vertical structure important for fish habitat", image: '/PillarCoral.jpg' },
      { name: "Colpophyllia natans", common: "Boulder Brain Coral", role: "Builds reefs and shelters marine life", image: '/BoulderBrain.png' },
      { name: "Dichocoenia stokesii", common: "Elliptical Star Coral", role: "Boosts reef diversity and grows in tough areas", image: '/StarCoral.png' },
      { name: "Diploria labyrinthiformis", common: "Grooved Brain Coral", role: "Strengthens reefs and houses sea creatures", image: '/GroovedBrain.png' },
      { name: "Eusmilia fastigiata", common: "Smooth Flower Coral", role: "Adds variety and shelters small animals", image: '/SmoothCoral.png' },
    ],
    moderatelyAffected: [
      { name: "Montastraea cavernosa", common: "Great Star Coral", role: "Major reef builder in Caribbean reefs", image: "/GreatStar.png" },
      { name: "Siderastrea siderea", common: "Massive Starlet Coral", role: "Maintaining reef health in high-temperature environments.", image: "/Starlet.png" },
      { name: "Orbicella annularis", common: "Boulder Star Coral", role: "Creates habitats and protects coastlines from erosion", image: '/BoulderStar.png' },
      { name: "Orbicella faveolata", common: "Mountainous Star Coral", role: "Provides habitat for marine organisms", image: '/MountainStar.png' },
      { name: "Stephanocoenia intersepta", common: "Blushing Star Coral", role: "Secondary reef builder and serves as a habitat for smaller reef organisms", image: '/BlushingStar.png' },
      { name: "Solenastrea bournoni", common: "Smooth Star Coral", role: "Provides microhabitats for small invertebrates and supports reef recovery", image: '/SmoothStar.png' },
    ],
    resistant: [
      { name: "Porites astreoides", common: "Mustard Hill Coral", role: "Early colonizer in reef recovery", image: '/MustardHill.jpg' },
      { name: "Acropora palmata", common: "Elkhorn Coral", role: "Creates reef framework and coastal protection", image: '/ElkHorn.jpg' },
      { name: "Porites porites", common: "Finger Coral", role: "Builds reefs and provides shelter for small marine creatures", image: '/Finger.jpg' },
      { name: "Porites divaricata", common: "Thin Finger Coral", role: "Adds structure to reefs and supports marine biodiversity.", image: '/ThinFinger.jpg' },
      { name: "Porites furcata", common: "Branched Finger Coral", role: "Creates habitats for marine life and helps reefs grow.", image: '/Branched.jpg' },
      { name: "Acropora cervicornis", common: "Staghorn Coral", role: " Grows rapidly to form reefs and offers shelter for fish and invertebrates.", image: '/Staghorn.jpg' },
    ]
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Hero Section */}
      <div className='relative h-96 bg-blue-900'>
        <div className='absolute inset-0'>
          <img 
            src='/pexels-francesco-ungaro-3157890.png'
            alt="Coral Reef"
            className='w-full h-full object-cover opacity-50'
          />
        </div>
        <div className='relative h-full flex flex-col justify-center items-center text-white p-6 text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>
            Understanding Stony Coral Tissue Loss Disease
          </h1>
          <p className='text-xl mb-8 max-w-2xl'>
            Join the fight against one of the most lethal coral diseases threatening our reefs
          </p>
          <div className='flex gap-4'>
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => navigate('/report')}
            >
              Report SCTLD
            </Button>
            <a href='https://cdhc.noaa.gov/coral-disease/characterized-diseases/stony-coral-tissue-loss-disease-sctld/' target='_blank' rel='noopener noreferrer'>
              <Button variant="outline" className="text-blue-500 border-white hover:bg-white/10" >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-12'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-8'>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="causes">Causes & Spread</TabsTrigger>
            <TabsTrigger value="species">Affected Species</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] rounded-md border p-4">
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What is SCTLD?</CardTitle>
                  <CardDescription>SCTLD (Stony Coral Tissue Loss Disease) is a highly lethal coral disease that was first identified off the coast of Miami, Florida in 2014. The disease appears as rapidly spreading white lesions on coral colonies that can kill entire coral colonies within weeks or months. It affects over 20 different species of hard corals, with some species like brain corals and pillar corals being particularly susceptible. Unlike some other coral diseases, SCTLD has proven to be unusually persistent and virulent, spreading throughout the Caribbean Sea and causing unprecedented coral mortality rates. Scientists believe it is caused by bacterial pathogens, though the exact cause remains under investigation. The disease has had devastating impacts on coral reef ecosystems, with some areas experiencing up to 60-100% mortality of susceptible species, leading to significant ecological and economic consequences for affected regions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    <div className='grid md:grid-cols-2 gap-8'>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold'>Economic Impact</h3>
                        <ul className='list-disc pl-6 space-y-2'>
                          <li>Tourism revenue losses estimated at millions annually</li>
                          <li>Decreased fisheries productivity</li>
                          <li>Increased coastal protection costs</li>
                        </ul>
                      </div>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold'>Ecological Impact</h3>
                        <ul className='list-disc pl-6 space-y-2'>
                          <li>Reduced reef biodiversity</li>
                          <li>Loss of critical fish habitat</li>
                          <li>Weakened coastal protection</li>
                        </ul>
                      </div>
                    </div>

                    <div className='mt-8'>
                      <h3 className='text-lg font-semibold mb-4'>Timeline of SCTLD</h3>
                      <div className='relative border-l-2 border-blue-200 pl-4 space-y-4'>
                        <div>
                          <span className='text-sm text-blue-600'>2014</span>
                          <p className='text-gray-700'>First reported in Florida's Miami-Dade County</p>
                        </div>
                        <div>
                          <span className='text-sm text-blue-600'>2016</span>
                          <p className='text-gray-700'>Spread to the Florida Keys</p>
                        </div>
                        <div>
                          <span className='text-sm text-blue-600'>2018</span>
                          <p className='text-gray-700'>Reached Caribbean islands</p>
                        </div>
                        <div>
                          <span className='text-sm text-blue-600'>Present</span>
                          <p className='text-gray-700'>Continued spread and ongoing research efforts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="causes">
              <Card>
                <CardHeader>
                  <CardTitle>Causes and Transmission</CardTitle>
                  <CardDescription>
                    Understanding how SCTLD spreads is crucial for controlling its impact on reef ecosystems.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    <div className='grid md:grid-cols-2 gap-8'>
                      <div className='space-y-6'>
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Direct Contact</h3>
                          <p className='text-gray-600'>
                            When diseased corals physically touch healthy corals, the disease can transfer directly between colonies. This often happens in dense reef areas where colonies grow close together.
                          </p>
                        </div>

                        <div>
                          <h3 className='text-lg font-semibold mb-3'>Water Transmission</h3>
                          <p className='text-gray-600 mb-2'>
                            The disease pathogens can move through seawater, allowing SCTLD to infect corals without direct contact. This makes it particularly concerning for several reasons:
                          </p>
                          <ul className='list-disc pl-6 space-y-2 text-gray-600'>
                          <li>Jump across gaps in the reef</li>
                          <li>Spread over longer distances via ocean currents</li>
                          <li>Potentially be transmitted through ballast water in ships</li>
                          </ul>
                        </div>
                      </div>

                      <div className='space-y-6'>
                        <div>
                          <h3 className='text-lg font-semibold mb-3'>Sediment Transport</h3>
                          <p className='text-gray-600 mb-2'>
                            There's evidence that the disease-causing bacteria can survive in seafloor sediments, which can then be stirred up by:
                          </p>
                          <ul className='list-disc pl-6 space-y-2 text-gray-600'>
                            <li>Storm events</li>
                            <li>Wave action</li>
                            <li>Human activities like dredging</li>
                            <li>Ship traffic</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className='text-lg font-semibold mb-3'>Secondary Vectors</h3>
                          <p className='text-gray-600 mb-2'>
                            While not fully confirmed, researchers suspect that certain marine organisms might help spread the disease by:
                          </p>
                          <ul className='list-disc pl-6 space-y-2 text-gray-600'>
                            <li>Moving between infected and healthy corals</li>
                            <li>Carrying disease-causing agents on their bodies</li>
                            <li>Potentially feeding on diseased coral tissue and then visiting healthy colonies</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className='bg-blue-50 p-6 rounded-lg mt-6'>
                      <p className='text-gray-700'>
                        The disease's ability to spread through multiple pathways, combined with its high virulence, makes it particularly challenging to control once it appears in a reef system. Water temperatures and quality may also influence its spread, though the exact environmental factors are still being studied.
                      </p>
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold mb-4'>
                        Contributing Factors
                      </h3>
                      <Accordion type='single' collapsible>
                        <AccordionItem value="climate">
                          <AccordionTrigger>Climate Change Impact</AccordionTrigger>
                          <AccordionContent>
                            <ul className='list-disc pl-6 space-y-2'>
                              <li>Increased water temperatures</li>
                              <li>Ocean acidification</li>
                              <li>Changed water chemistry</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="human">
                          <AccordionTrigger>Human Activities</AccordionTrigger>
                          <AccordionContent>
                              <ul className='list-disc pl-6 space-y-2'>
                                <li>Coastal development</li>
                                <li>Water pollution</li>
                                <li>Marine traffic</li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                    <div>
                      <h3 className='text-lg font-semibold mb-4'>Research Resources</h3>
                      <div className='space-y-2'>
                        <a href='https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2023.1321271/full' target='_blank' rel='noopener noreferrer'>
                          <Button variant="link" className="text-blue-500">
                            Latest Scientific Studies
                          </Button>
                        </a>
                        <a href='/fmars-10-1321271.pdf' download>
                          <Button variant="link" className="text-blue-500">
                            <Download className='w-4 h-4 mr-2'/>
                            Download Research Summary
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="species" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Affected Coral Species</CardTitle>
                  <CardDescription>Species susceptibility and ecological roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-8'>
                    <div>
                      <h3 className='text-lg font-semibold text-red-600 mb-4'>
                        Highly Susceptible Species
                      </h3>
                      <div className='grid md:grid-cols-2 gap-4'>
                        {speciesList.highlyAffected.map((species) => (
                          <TooltipProvider key={species.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='p-4 border rounded-lg hover:bg-gray-50'>
                                  <h4 className='font-semibold italic'>{species.name}</h4>
                                  <p className='text-sm text-gray-600'>{species.common}</p>
                                  <div className='relative mt-6 aspect-video h-[130px] bg-gray-100 rounded-lg overflow-hidden'>
                                  <img
                                    src={species.image}
                                    alt={species.common}
                                    className='w-full h-full object-cover'
                                  />
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='text-sm'>{species.role}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-blue-600 mb-4'>
                        Moderately Susceptible Species
                      </h3>
                      <div className='grid md:grid-cols-2 gap-4'>
                        {speciesList.moderatelyAffected.map((species) => (
                          <TooltipProvider key={species.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='p-4 border rounded-lg hover:bg-gray-50'>
                                  <h4 className='font-semibold italic'>{species.name}</h4>
                                  <p className='text-sm text-gray-600'>{species.common}</p>
                                  <div className='relative mt-6 aspect-video h-[130px] bg-gray-100 rounded-lg overflow-hidden'>
                                  <img
                                    src={species.image}
                                    alt={species.common}
                                    className='w-full h-full object-cover'
                                  />
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='text-sm'>{species.role}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-green-600 mb-4'>
                        Resistant Species
                      </h3>
                      <div className='grid md:grid-cols-2 gap-4'>
                        {speciesList.resistant.map((species) => (
                          <TooltipProvider key={species.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='p-4 border rounded-lg hover:bg-gray-50'>
                                  <h4 className='font-semibold italic'>{species.name}</h4>
                                  <p className='text-sm text-gray-600'>{species.common}</p>
                                  <div className='relative mt-6 aspect-video h-[130px] bg-gray-100 rounded-lg overflow-hidden'>
                                  <img
                                    src={species.image}
                                    alt={species.common}
                                    className='w-full h-full object-cover'
                                  />
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='text-sm'>{species.role}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Methods</CardTitle>
                  <CardDescription>Current appraches and ongoing research</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-8'>
                    <div className='grid md:grid-cols-2 gap-8'>
                      <div>
                        <h3 className='text-lg font-semibold mb-4'>
                          Current Treatments
                        </h3>
                        <Accordion type='single' collapsible>
                          <AccordionItem value="antibiotics">
                            <AccordionTrigger>Antibiotic Application</AccordionTrigger>
                            <AccordionContent>
                              <p className='text-gray-600 mb-2'>
                                Amoxicillin-based paste applied directly to infected colonies
                              </p>
                              <ul className='list-disc pl-6 space-x-2'>
                                <li>70-90% success rate when applied early</li>
                                <li>Requires manual application by divers</li>
                                <li>Time and resource-intensive</li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value='probiotics'>
                            <AccordionTrigger>Probiotic Treatments</AccordionTrigger>
                            <AccordionContent>
                              <p className='text-gray-600'>
                                Experimental treatments using beneficial bacteria to combat SCTLD
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold mb-4'>Treatment Challenges</h3>
                        <ul className='list-disc pl-6 space-y-2'>
                          <li>Large scale of affected areas</li>
                          <li>Limited resources and funding</li>
                          <li>Difficulty in early detection</li>
                          <li>Environmental factors affecting treatment efficacy</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold mb-4'>
                        Get Involved
                      </h3>
                      <div className='grid md:grid-cols-2 gap-4'>
                        <a href='https://myfwc.com/conservation/coral/' target='_blank' rel='noopener noreferrer'>
                          <Button className="w-full">
                            Volunteer for Treatment Teams
                          </Button>
                        </a>
                        <a href='https://floridadep.gov/rcp/coral/content/stony-coral-tissue-loss-disease-response' target='_blank' rel='noopener noreferrer'>
                          <Button variant="outline" className="w-full">
                            Support Research Efforts
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      <div className='bg-blue-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-6'>Join the Fight Against SCTLD!</h2>
          <div className='flex justify-center gap-4'>
            <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100" onClick={() => navigate('/report')}>
              Report Cases <ChevronRight  className='ml-2 h-4 w-4'/>
            </Button>
            <a href='https://myfwc.com/conservation/coral/' target='_blank' rel='noopener noreferrer'>
              <Button size="lg" variant="outline" className="border-white text-blue-500 hover:bg-white/10">
                Volunteer
              </Button>
            </a>
            <a href='GOVPUB-C55_400-PURL-gpo157688.pdf' download>
              <Button size="lg" variant="outline" className="border-white text-blue-500 hover:bg-white/10">
                Download Resources
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Info