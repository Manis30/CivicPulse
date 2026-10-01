import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LuUserRound,
  LuMail,
  LuPhone,
  LuMapPin,
  LuHouse,
  LuSave,
  LuCheck,
  LuLoader
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { ProfileField } from './ProfileField';

interface PersonalInformationCardProps {
  fullName: string;
  email: string;
  phone: string;
  primaryWard: string;
  residentialAddress: string;
  wardsOptions: string[];
  saveStatus: 'idle' | 'saving' | 'saved';
  onFullNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onWardChange: (val: string) => void;
  onAddressChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PersonalInformationCard({
  fullName,
  email,
  phone,
  primaryWard,
  residentialAddress,
  wardsOptions,
  saveStatus,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
  onWardChange,
  onAddressChange,
  onSubmit,
}: PersonalInformationCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.14, ease: 'easeOut' }}
      className="bg-white rounded-[16px] border border-[#DCE6E1] p-4 sm:p-5 shadow-xs text-left select-none space-y-3"
    >
      {/* Header: PERSONAL INFORMATION */}
      <div className="pb-2 border-b border-[#E2E9E5] flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-[13px] font-extrabold font-heading text-[#102A43] uppercase tracking-wide">
            Personal Information
          </h3>
          <p className="text-[11px] sm:text-[11.5px] text-[#627D98] font-sans">
            Your basic contact and civic details.
          </p>
        </div>
      </div>

      {/* Compact 2-Column Form Fields (38-40px height, 10-12px spacing) */}
      <form onSubmit={onSubmit} className="space-y-2.5">
        {/* Row 1: Full Name & Email Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <ProfileField label="Full Name" id="profile-name" icon={LuUserRound}>
            <input
              id="profile-name"
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              className="w-full h-[38px] sm:h-[40px] px-3 bg-white border border-[#DCE6E1] hover:border-[#102A43]/25 focus:border-[#159A68] focus:ring-2 focus:ring-[#159A68]/15 rounded-xl text-xs sm:text-[13px] text-[#102A43] shadow-2xs outline-none transition-all placeholder:text-[#829AB1]"
              required
            />
          </ProfileField>

          <ProfileField label="Email Address" id="profile-email" icon={LuMail}>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full h-[38px] sm:h-[40px] px-3 bg-white border border-[#DCE6E1] hover:border-[#102A43]/25 focus:border-[#159A68] focus:ring-2 focus:ring-[#159A68]/15 rounded-xl text-xs sm:text-[13px] text-[#102A43] shadow-2xs outline-none transition-all placeholder:text-[#829AB1]"
              required
            />
          </ProfileField>
        </div>

        {/* Row 2: Phone Number & Primary Ward */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <ProfileField label="Phone Number" id="profile-phone" icon={LuPhone}>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+1 (555) 018-4411"
              className="w-full h-[38px] sm:h-[40px] px-3 bg-white border border-[#DCE6E1] hover:border-[#102A43]/25 focus:border-[#159A68] focus:ring-2 focus:ring-[#159A68]/15 rounded-xl text-xs sm:text-[13px] text-[#102A43] shadow-2xs outline-none transition-all placeholder:text-[#829AB1]"
            />
          </ProfileField>

          <ProfileField label="Primary Ward" id="profile-ward" icon={LuMapPin}>
            <select
              id="profile-ward"
              value={primaryWard}
              onChange={(e) => onWardChange(e.target.value)}
              className="w-full h-[38px] sm:h-[40px] px-3 bg-white border border-[#DCE6E1] hover:border-[#102A43]/25 focus:border-[#159A68] focus:ring-2 focus:ring-[#159A68]/15 rounded-xl text-xs sm:text-[13px] text-[#102A43] shadow-2xs outline-none transition-all cursor-pointer font-medium"
            >
              {wardsOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </ProfileField>
        </div>

        {/* Row 3: Residential Address */}
        <ProfileField label="Residential Address" id="profile-address" icon={LuHouse}>
          <input
            id="profile-address"
            type="text"
            value={residentialAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="14, 2nd Cross, MG Road, Ward 12, Hosur"
            className="w-full h-[38px] sm:h-[40px] px-3 bg-white border border-[#DCE6E1] hover:border-[#102A43]/25 focus:border-[#159A68] focus:ring-2 focus:ring-[#159A68]/15 rounded-xl text-xs sm:text-[13px] text-[#102A43] shadow-2xs outline-none transition-all placeholder:text-[#829AB1]"
          />
        </ProfileField>

        {/* Right-aligned Save Button (38-40px height, 10px radius) */}
        <div className="pt-1.5 flex items-center justify-end">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 h-[38px] sm:h-[40px] px-5 rounded-[10px] text-xs font-bold font-heading transition-all shadow-xs cursor-pointer min-w-[130px]',
              saveStatus === 'saved'
                ? 'bg-[#0D6846] text-white shadow-[#0D6846]/20'
                : 'bg-[#159A68] hover:bg-[#128358] text-white shadow-[#159A68]/20 active:scale-97'
            )}
          >
            {saveStatus === 'saving' ? (
              <>
                <LuLoader className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <LuCheck className="w-3.5 h-3.5 stroke-[2.8]" />
                <span>✓ Saved</span>
              </>
            ) : (
              <>
                <LuSave className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default PersonalInformationCard;
