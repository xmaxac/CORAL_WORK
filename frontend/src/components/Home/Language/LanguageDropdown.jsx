import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import USFlag from '@/assets/flags/united-states.svg'
import ESFlag from '@/assets/flags/spain.svg'

const languesOptions = [
  { code: 'en', name: 'English', flag: USFlag },
  { code: 'es', name: 'Español', flag: ESFlag },
];

const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);

    localStorage.setItem('language', languageCode);
  };

  const currentFlag = languesOptions.find(lang => lang.code === currentLanguage)?.flag || USFlag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon'>
          <img 
            src={currentFlag}
            alt={`${currentLanguage} flag`}
            className='w-6 h-4 object-cover cursor-pointer'
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languesOptions.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className='flex items-center space-x-2'
          >
            <img 
              src={lang.flag}
              alt={`${lang.code} flag`}
              className='w-6 h-4 object-cover mr-2'
            />
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageDropdown