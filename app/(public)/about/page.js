'use client'

import Link from 'next/link'
import { ChevronRight, Target, Eye, CheckCircle } from 'lucide-react'
import { INSTITUTION } from '@/src/lib/constants'

// Page Hero Component
function PageHero({ title, breadcrumbs }) {
  return (
    <section className="h-[280px] bg-brand flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-serif text-4xl text-white mb-4">
        {title}
      </h1>
      <nav className="flex items-center gap-1 text-sm text-white/60">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight size={14} />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-white transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </section>
  )
}

// Mission & Vision Section
function MissionVision() {
  const cards = [
    {
      icon: Target,
      title: 'Our Mission',
      content: 'To provide quality education that empowers students with knowledge, skills, and values to become responsible citizens and lifelong learners who contribute positively to society.',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      content: 'To be a leading educational institution recognized for academic excellence, innovative teaching methodologies, and holistic development of students in a nurturing environment.',
    },
  ]
  
  return (
    <section className="py-16 bg-background">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div 
                key={idx}
                className="bg-neutral-50 border-l-4 border-l-brand border border-[#E8DFD4] rounded-r-md p-6"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="font-serif text-2xl text-brand mb-3">
                  {card.title}
                </h3>
                <p className="text-md text-neutral-700 leading-relaxed">
                  {card.content}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Objectives Section
function Objectives() {
  const objectives = [
    {
      title: 'Academic Excellence',
      description: 'Foster a culture of academic rigor and intellectual curiosity among students.',
    },
    {
      title: 'Character Building',
      description: 'Instill strong moral values, ethics, and discipline in every student.',
    },
    {
      title: 'Holistic Development',
      description: 'Encourage participation in sports, arts, and extracurricular activities.',
    },
    {
      title: 'Modern Learning',
      description: 'Integrate technology and innovative teaching methods in education.',
    },
    {
      title: 'Community Service',
      description: 'Develop a sense of social responsibility and community engagement.',
    },
    {
      title: 'Global Perspective',
      description: 'Prepare students to be global citizens with cultural awareness.',
    },
  ]
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-brand">
            Our Objectives
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {objectives.map((obj, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="shrink-0">
                <CheckCircle size={20} className="text-brand mt-0.5" />
              </div>
              <div>
                <h4 className="text-md font-medium text-neutral-900 mb-1">
                  {obj.title}
                </h4>
                <p className="text-sm text-neutral-600">
                  {obj.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Institution Details Section
function InstitutionDetails() {
  const details = [
    { label: 'Established', value: '2005' },
    { label: 'Location', value: 'City, State - 123456' },
    { label: 'Type', value: 'Co-Educational Institution' },
    { label: 'Affiliation', value: 'State Education Board' },
    { label: 'Principal', value: 'Dr. John Smith' },
    { label: 'Student Strength', value: '500+' },
  ]
  
  return (
    <section className="py-16 bg-surface">
      <div className="max-w-[800px] mx-auto px-6">
        <h2 className="font-serif text-3xl text-brand text-center mb-10">
          Institution Details
        </h2>
        
        <div className="bg-white border border-[#E8DFD4] rounded-md overflow-hidden">
          {details.map((item, idx) => (
            <div 
              key={idx}
              className={`grid grid-cols-2 gap-4 px-6 py-4 ${
                idx % 2 === 0 ? 'bg-neutral-50' : 'bg-white'
              } ${idx < details.length - 1 ? 'border-b border-[#E8DFD4]' : ''}`}
            >
              <span className="text-sm font-medium text-neutral-700">
                {item.label}
              </span>
              <span className="text-sm text-neutral-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <PageHero 
        title="About Our Institution"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About' },
        ]}
      />
      <MissionVision />
      <Objectives />
      <InstitutionDetails />
    </>
  )
}
