import React from 'react'
import dayjs from 'dayjs';
import Image from 'next/image'
import { getInterviewCoverByIndex, getIconPairByIndex } from '@/lib/utils';
import  DisplayTechIcons from  './DisplayTechIcons';
import { Button } from './ui/button';
import Link from 'next/link';

interface InterviewCardProps {
  interviewId: string;
  userId: string;
  company?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string;
  isDummy?: boolean; // Add this prop to identify dummy interviews
  index?: number; // Add index prop for deterministic icon/cover selection
}

const COMPANY_LOGO_MAP: Record<string, string> = {
  google: '/covers/google.svg',
  amazon: '/covers/amazon.png',
  meta: '/covers/facebook.png',
  apple: '/covers/apple.svg',
  netflix: '/covers/netflix.svg',
  microsoft: '/covers/microsoft.svg',
};

const getStableIndexFromInterviewId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i)) % 997;
  }
  return hash;
};

const InterviewCard = ({interviewId, company, role,type,techstack,createdAt, isDummy = false, index = 0}: InterviewCardProps) => {
    const feedback = null as Feedback | null;
    const normalixedType = /mix/gi.test(type) ? 'Mixed' :type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('DD/MM/YYYY');
    const normalizedCompany = company?.trim().toLowerCase() || '';
    const companyLogo = normalizedCompany ? COMPANY_LOGO_MAP[normalizedCompany] : undefined;
    
    // Use selected FAANG company branding when available; otherwise fall back to a stable cover.
    const coverImage = companyLogo
      ? companyLogo
      : isDummy
        ? getInterviewCoverByIndex(index)
        : getInterviewCoverByIndex(getStableIndexFromInterviewId(interviewId));
    const iconPair = isDummy ? getIconPairByIndex(index) : null;
  
  // For dummy interviews, create a URL with pre-filled data
  const getInterviewUrl = () => {
    if (isDummy) {
      const params = new URLSearchParams({
        role: role,
        type: type.toLowerCase(),
        level: 'junior', // default level
        techstack: techstack.join(',')
      });
      return `/interview?${params.toString()}`;
    }
    
    // For real interviews
    return feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}/questions`;
  };
  
  const getButtonText = () => {
    if (isDummy) {
      return 'Start Interview';
    }
    return feedback ? 'Check Feedback' : 'View Interview';
  };

  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
      <div className='card-interview'>
        <div>
            <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
                <p className='badge-text'>{normalixedType}</p>
            </div>
            <Image src={coverImage} alt='cover image' width={90} height={90} className='rounded-full object-fit size-[90px] '/>
            <h3 className='mt-5 capitalize'>
              {company ? `${company} • ${role}` : `${role} Interview`}
            </h3>

            <div className='flex flex-row gap-5 mt-3'>
            
                <div className='flex flex-row gap-2'>
                    <Image 
                        src={isDummy && iconPair ? iconPair.firstIcon : '/calendar.svg'} 
                        alt='calendar' 
                        width={22} 
                        height={22} 
                    />
                    <p>{formattedDate}</p>
                </div>

                <div className='flex flex-row gap-2 items-center'>
                    <Image 
                        src={isDummy && iconPair ? iconPair.secondIcon : '/star.svg'} 
                        alt='star' 
                        width={22} 
                        height={22} 
                    />
                    <p>{feedback?.totalScore || '---'}/100</p>
                </div>
            
            </div> 
            <p className='line-clamp-2 mt-5'>
                {feedback?.finalAssessment || "You haven't taken the interview yet. Take it now to improve your skills."}

            </p>
        </div>

        <div className='flex flex-row justify-between'>
            <DisplayTechIcons techStack={techstack} />
            <Button className='btn-primary'>
                <Link href={getInterviewUrl()}>
                  {getButtonText()}
                </Link>
            </Button>
        </div>

      </div>
    </div>
  )
}

export default InterviewCard
