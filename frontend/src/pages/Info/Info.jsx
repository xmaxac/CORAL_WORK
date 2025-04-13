/**
 * Info Page Component
 * 
 * This component displays information about Stony Coral Tissue Loss Disease (SCTLD) including:
 * - Overview of the disease
 * - Causes and contributing factors
 * - Species affected by the disease
 * - Current treatments and challenges
 * - Resources for getting involved and learning more
 * 
 * This page does not require user authentication to view content.
 */

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
import { useTranslation } from "react-i18next";

const Info = () => {
  // State to track the active tab in the Tabs component
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

   // Hook for handling multi-language text translation
  const {t} = useTranslation();

  // List of coral species affected by SCTLD/resistant and related information
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
      <div className='relative h-96 md:h-[500px] bg-blue-900'>
        <div className='absolute inset-0'>
          <img 
            src='/pexels-francesco-ungaro-3157890.png'
            alt="Coral Reef"
            className='w-full h-full object-cover opacity-50'
          />
        </div>
        <div className='relative h-full flex flex-col justify-center items-center text-white p-6 text-center'>
          <h1 className='text-3xl md:text-5xl font-bold mb-4'>
            {t('info.hero.title')}
          </h1>
          <p className='text-base md:text-xl mb-8 max-w-2xl'>
            {t('info.hero.subtitle')}
          </p>
          <div className='flex flex-col md:flex-row gap-4'>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 mb-2 md:mb-0"
              onClick={() => navigate('/report')}
            >
              {t('info.hero.buttons.report')}
            </Button>
            <a href='https://cdhc.noaa.gov/coral-disease/characterized-diseases/stony-coral-tissue-loss-disease-sctld/' target='_blank' rel='noopener noreferrer'>
              <Button variant="outline" className="text-blue-500 border-white hover:bg-white/10 mb-2 md:mb-0" >
                {t('info.hero.buttons.learnMore')}
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 py-12'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-8'>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">{t('info.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="causes">{t('info.tabs.causes')}</TabsTrigger>
            <TabsTrigger value="species">{t('info.tabs.species')}</TabsTrigger>
            <TabsTrigger value="treatment">{t('info.tabs.treatment')}</TabsTrigger>
            <TabsTrigger></TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] md:h-[600px] rounded-md border p-2 md:p-4">
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('info.overview.title')}</CardTitle>
                  <CardDescription>{t('info.overview.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8'>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold'>{t('info.overview.economicImpact.title')}</h3>
                        <ul className='list-disc pl-6 space-y-2'>
                          <li>{t('info.overview.economicImpact.items.0')}</li>
                          <li>{t('info.overview.economicImpact.items.1')}</li>
                          <li>{t('info.overview.economicImpact.items.2')}</li>
                        </ul>
                      </div>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold'>{t('info.overview.ecologicalImpact.title')}</h3>
                        <ul className='list-disc pl-6 space-y-2'>
                          <li>{t('info.overview.ecologicalImpact.items.0')}</li>
                          <li>{t('info.overview.ecologicalImpact.items.1')}</li>
                          <li>{t('info.overview.ecologicalImpact.items.2')}</li>
                        </ul>
                      </div>
                    </div>

                    <div className='mt-8'>
                      <h3 className='text-lg font-semibold mb-4'>{t('info.overview.timeline.title')}</h3>
                      <div className='relative border-l-2 border-blue-200 pl-4 space-y-4'>
                        <div>
                          <span className='text-sm text-blue-600'>2014</span>
                          <p className='text-gray-700'>{t('info.overview.timeline.2014')}</p>
                        </div>
                        <div>
                          <span className='text-sm text-blue-600'>2016</span>
                          <p className='text-gray-700'>{t('info.overview.timeline.2016')}</p>
                        </div>
                        <div>
                          <span className='text-sm text-blue-600'>2018</span>
                          <p className='text-gray-700'>{t('info.overview.timeline.2018')}</p>
                        </div>
                        <div>
                          <span className='text-sm text-blue-600'>Present</span>
                          <p className='text-gray-700'>{t('info.overview.timeline.present')}</p>
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
                  <CardTitle>{t('info.causes.title')}</CardTitle>
                  <CardDescription>
                  {t('info.causes.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    <div className='grid md:grid-cols-2 gap-8'>
                      <div className='space-y-6'>
                        <div>
                          <h3 className="text-lg font-semibold mb-3">{t('info.causes.transmissionMethods.directContact.title')}</h3>
                          <p className='text-gray-600'>
                          {t('info.causes.transmissionMethods.directContact.description')}
                          </p>
                        </div>

                        <div>
                          <h3 className='text-lg font-semibold mb-3'>{t('info.causes.transmissionMethods.waterTransmission.title')}</h3>
                          <p className='text-gray-600 mb-2'>
                          {t('info.causes.transmissionMethods.waterTransmission.description')}
                          </p>
                          <ul className='list-disc pl-6 space-y-2 text-gray-600'>
                          <li>{t('info.causes.transmissionMethods.waterTransmission.risks.0')}</li>
                          <li>{t('info.causes.transmissionMethods.waterTransmission.risks.1')}</li>
                          <li>{t('info.causes.transmissionMethods.waterTransmission.risks.2')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className='space-y-6'>
                        <div>
                          <h3 className='text-lg font-semibold mb-3'>{t('info.causes.transmissionMethods.sedimentTransport.title')}</h3>
                          <p className='text-gray-600 mb-2'>
                          {t('info.causes.transmissionMethods.sedimentTransport.description')}
                          </p>
                          <ul className='list-disc pl-6 space-y-2 text-gray-600'>
                            <li>{t('info.causes.transmissionMethods.sedimentTransport.causes.0')}</li>
                            <li>{t('info.causes.transmissionMethods.sedimentTransport.causes.1')}</li>
                            <li>{t('info.causes.transmissionMethods.sedimentTransport.causes.2')}</li>
                            <li>{t('info.causes.transmissionMethods.sedimentTransport.causes.3')}</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className='text-lg font-semibold mb-3'>{t('info.causes.transmissionMethods.secondaryVectors.title')}</h3>
                          <p className='text-gray-600 mb-2'>
                          {t('info.causes.transmissionMethods.secondaryVectors.description')}
                          </p>
                          <ul className='list-disc pl-6 space-y-2 text-gray-600'>
                            <li>{t('info.causes.transmissionMethods.secondaryVectors.methods.0')}</li>
                            <li>{t('info.causes.transmissionMethods.secondaryVectors.methods.1')}</li>
                            <li>{t('info.causes.transmissionMethods.secondaryVectors.methods.2')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold mb-4'>
                      {t('info.causes.contributingFactors.title')}
                      </h3>
                      <Accordion type='single' collapsible>
                        <AccordionItem value="climate">
                          <AccordionTrigger>{t('info.causes.contributingFactors.climateChange.title')}</AccordionTrigger>
                          <AccordionContent>
                            <ul className='list-disc pl-6 space-y-2'>
                              <li>{t('info.causes.contributingFactors.climateChange.items.0')}</li>
                              <li>{t('info.causes.contributingFactors.climateChange.items.1')}</li>
                              <li>{t('info.causes.contributingFactors.climateChange.items.2')}</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="human">
                          <AccordionTrigger>{t('info.causes.contributingFactors.humanActivities.title')}</AccordionTrigger>
                          <AccordionContent>
                              <ul className='list-disc pl-6 space-y-2'>
                                <li>{t('info.causes.contributingFactors.humanActivities.items.0')}</li>
                                <li>{t('info.causes.contributingFactors.humanActivities.items.1')}</li>
                                <li>{t('info.causes.contributingFactors.humanActivities.items.2')}</li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                    <div>
                      <h3 className='text-lg font-semibold mb-4'>{t('info.causes.researchResources.title')}</h3>
                      <div className='space-y-2'>
                        <a href='https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2023.1321271/full' target='_blank' rel='noopener noreferrer'>
                          <Button variant="link" className="text-blue-500">
                          {t('info.causes.researchResources.scientificStudies')}
                          </Button>
                        </a>
                        <a href='/fmars-10-1321271.pdf' download>
                          <Button variant="link" className="text-blue-500">
                            <Download className='w-4 h-4 mr-2'/>
                            {t('info.causes.researchResources.downloadSummary')}
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
                  <CardTitle>{t('info.species.title')}</CardTitle>
                  <CardDescription>{t('info.species.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-8'>
                    <div>
                      <h3 className='text-lg font-semibold text-red-600 mb-4'>
                      {t('info.species.categories.highlyAffected.title')}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8'>
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
                      {t('info.species.categories.moderatelyAffected.title')}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8'>
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
                      {t('info.species.categories.resistant.title')}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8'>
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
                  <CardTitle>{t("info.treatment.title")}</CardTitle>
                  <CardDescription>{t("info.treatment.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-8'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8'>
                      <div>
                        <h3 className='text-lg font-semibold mb-4'>
                          {t("info.treatment.currentTreatments.title")}
                        </h3>
                        <Accordion type='single' collapsible>
                          <AccordionItem value="antibiotics">
                            <AccordionTrigger>{t("info.treatment.currentTreatments.antibiotics.title")}</AccordionTrigger>
                            <AccordionContent>
                              <p className='text-gray-600 mb-2'>
                              {t("info.treatment.currentTreatments.antibiotics.description")}
                              </p>
                              <ul className='list-disc pl-6 space-x-2'>
                                <li>{t("info.treatment.currentTreatments.antibiotics.details.0")}</li>
                                <li>{t("info.treatment.currentTreatments.antibiotics.details.1")}</li>
                                <li>{t("info.treatment.currentTreatments.antibiotics.details.2")}</li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value='probiotics'>
                            <AccordionTrigger>{t("info.treatment.currentTreatments.probiotics.title")}</AccordionTrigger>
                            <AccordionContent>
                              <p className='text-gray-600'>
                                {t("info.treatment.currentTreatments.probiotics.description")}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold mb-4'>{t("info.treatment.challenges.title")}</h3>
                        <ul className='list-disc pl-6 space-y-2'>
                          <li>{t("info.treatment.challenges.items.0")}</li>
                          <li>{t("info.treatment.challenges.items.1")}</li>
                          <li>{t("info.treatment.challenges.items.2")}</li>
                          <li>{t("info.treatment.challenges.items.3")}</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold mb-4'>
                      {t("info.treatment.getInvolved.title")}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8'>
                        <a href='https://myfwc.com/conservation/coral/' target='_blank' rel='noopener noreferrer'>
                          <Button className="w-full">
                          {t("info.treatment.getInvolved.volunteerButton")}
                          </Button>
                        </a>
                        <a href='https://floridadep.gov/rcp/coral/content/stony-coral-tissue-loss-disease-response' target='_blank' rel='noopener noreferrer'>
                          <Button variant="outline" className="w-full">
                          {t("info.treatment.getInvolved.supportButton")}
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

      {/* Call to Action Section */}
      <div className='bg-blue-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-6'>{t("info.callToAction.title")}</h2>
          <div className='flex flex-col md:flex-row justify-center gap-4'>
            <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100" onClick={() => navigate('/report')}>
            {t("info.callToAction.buttons.report")}<ChevronRight  className='ml-2 h-4 w-4'/>
            </Button>
            <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100" onClick={() => navigate('/refrences')}>
            Refrences<ChevronRight  className='ml-2 h-4 w-4'/>
            </Button>
            <a href='https://myfwc.com/conservation/coral/' target='_blank' rel='noopener noreferrer'>
              <Button size="lg" variant="outline" className="border-white text-blue-500 hover:bg-white/10">
              {t("info.callToAction.buttons.volunteer")}
              </Button>
            </a>
            <a href='GOVPUB-C55_400-PURL-gpo157688.pdf' download>
              <Button size="lg" variant="outline" className="border-white text-blue-500 hover:bg-white/10">
              {t("info.callToAction.buttons.resources")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Info