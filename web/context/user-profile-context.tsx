"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Role } from "./role-context";

export interface ConnectedAccount {
  connected: boolean;
  handle?: string;
  verifiedAt?: string;
}

export interface ConnectedAccountsMap {
  google: ConnectedAccount;
  github: ConnectedAccount;
  linkedin: ConnectedAccount;
  leetcode: ConnectedAccount;
  hackerrank: ConnectedAccount;
  kaggle: ConnectedAccount;
}

export interface UserProfileData {
  name: string;
  email: string;
  role: Role;
  department: string;
  yearOrTitle: string;
  location: string;
  bio: string;
  careerGoal: string;
  employabilityScore: number;
  skillReadiness: number;
  profileStrength: number;
  skills: { name: string; score: number }[];
  connectedAccounts: ConnectedAccountsMap;
}

const defaultProfiles: Record<Role, UserProfileData> = {
  student: {
    name: "",
    email: "",
    role: "student",
    department: "Computer Science",
    yearOrTitle: "2nd Year",
    location: "Rourkela, Odisha",
    bio: "Passionate student focusing on full-stack web development, cloud computing, and automated systems.",
    careerGoal: "Backend Engineer",
    employabilityScore: 72,
    skillReadiness: 68,
    profileStrength: 65,
    skills: [
      { name: "Python", score: 82 },
      { name: "React", score: 75 },
      { name: "Node.js", score: 68 },
      { name: "SQL", score: 65 },
      { name: "Git & GitHub", score: 88 },
    ],
    connectedAccounts: {
      google: { connected: false },
      github: { connected: false },
      linkedin: { connected: false },
      leetcode: { connected: false },
      hackerrank: { connected: false },
      kaggle: { connected: false },
    },
  },
  alumni: {
    name: "",
    email: "",
    role: "alumni",
    department: "Computer Science & Engineering",
    yearOrTitle: "Senior Software Engineer @ Google",
    location: "Bengaluru, India",
    bio: "Class of 2021 graduate. Mentoring students in distributed systems, backend engineering, and system design.",
    careerGoal: "Mentorship & Internal Job Referrals",
    employabilityScore: 98,
    skillReadiness: 96,
    profileStrength: 85,
    skills: [
      { name: "Distributed Systems", score: 95 },
      { name: "System Design", score: 92 },
      { name: "Go & Kubernetes", score: 90 },
      { name: "Technical Mentorship", score: 94 },
    ],
    connectedAccounts: {
      google: { connected: true, handle: "alumni.dev@gmail.com", verifiedAt: "2026-08-01" },
      github: { connected: true, handle: "alumni-dev", verifiedAt: "2026-08-01" },
      linkedin: { connected: true, handle: "alumni-linkedin", verifiedAt: "2026-08-01" },
      leetcode: { connected: true, handle: "alumni_coder", verifiedAt: "2026-08-01" },
      hackerrank: { connected: false },
      kaggle: { connected: false },
    },
  },
  faculty: {
    name: "",
    email: "",
    role: "faculty",
    department: "Computer Science & Engineering",
    yearOrTitle: "Professor & Academic Mentor",
    location: "Bhubaneswar, Odisha",
    bio: "Dedicated faculty mentor overseeing curriculum alignment, industry linkage, and student skill benchmarks.",
    careerGoal: "Academic Excellence & Research Guidance",
    employabilityScore: 95,
    skillReadiness: 92,
    profileStrength: 70,
    skills: [
      { name: "Curriculum Design", score: 95 },
      { name: "Research Guidance", score: 90 },
      { name: "Student Mentorship", score: 94 },
    ],
    connectedAccounts: {
      google: { connected: false },
      github: { connected: false },
      linkedin: { connected: false },
      leetcode: { connected: false },
      hackerrank: { connected: false },
      kaggle: { connected: false },
    },
  },
  institution: {
    name: "",
    email: "",
    role: "institution",
    department: "Training & Placement Cell",
    yearOrTitle: "Institutional Admin",
    location: "CUPGS Campus, Odisha",
    bio: "Institutional leadership driving placement readiness, industry partnerships, and campus skill gap analysis.",
    careerGoal: "100% Placement & Industry Alignment",
    employabilityScore: 90,
    skillReadiness: 88,
    profileStrength: 75,
    skills: [
      { name: "Campus Analytics", score: 92 },
      { name: "Industry Partnerships", score: 89 },
      { name: "Placement Management", score: 95 },
    ],
    connectedAccounts: {
      google: { connected: false },
      github: { connected: false },
      linkedin: { connected: false },
      leetcode: { connected: false },
      hackerrank: { connected: false },
      kaggle: { connected: false },
    },
  },
  industry: {
    name: "",
    email: "",
    role: "industry",
    department: "Engineering Talent Acquisition",
    yearOrTitle: "Lead Technical Recruiter",
    location: "Bengaluru, Karnataka",
    bio: "Recruiter scouting top-tier verified talent with verified project proofs and real skill telemetry.",
    careerGoal: "Talent Acquisition & Skill Benchmarking",
    employabilityScore: 96,
    skillReadiness: 94,
    profileStrength: 80,
    skills: [
      { name: "Technical Assessment", score: 96 },
      { name: "Talent Benchmarking", score: 94 },
      { name: "Hiring Strategy", score: 92 },
    ],
    connectedAccounts: {
      google: { connected: false },
      github: { connected: false },
      linkedin: { connected: false },
      leetcode: { connected: false },
      hackerrank: { connected: false },
      kaggle: { connected: false },
    },
  },
};

interface UserProfileContextValue {
  profiles: Record<Role, UserProfileData>;
  currentProfile: UserProfileData;
  updateProfile: (role: Role, updates: Partial<UserProfileData>) => void;
  toggleConnectedAccount: (role: Role, platform: keyof ConnectedAccountsMap, handle?: string) => void;
  hasProfileSetup: (role: Role) => boolean;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

const STORAGE_KEY = "skillsync-user-profiles";

export function UserProfileProvider({ children, currentRole }: { children: ReactNode; currentRole: Role }) {
  const [profiles, setProfiles] = useState<Record<Role, UserProfileData>>(defaultProfiles);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfiles((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (e) {
      console.error("Failed to load profiles from localStorage", e);
    }
    setLoaded(true);
  }, []);

  const saveProfiles = (newProfiles: Record<Role, UserProfileData>) => {
    setProfiles(newProfiles);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
    } catch (e) {
      console.error("Failed to save profiles to localStorage", e);
    }
  };

  const updateProfile = (role: Role, updates: Partial<UserProfileData>) => {
    const updatedRoleProfile = {
      ...profiles[role],
      ...updates,
    };
    let strength = 40;
    if (updatedRoleProfile.name) strength += 15;
    if (updatedRoleProfile.email) strength += 15;
    if (updatedRoleProfile.bio) strength += 10;

    const connectedCount = Object.values(updatedRoleProfile.connectedAccounts).filter((a) => a.connected).length;
    strength += connectedCount * 4;
    updatedRoleProfile.profileStrength = Math.min(100, strength);

    const nextProfiles = {
      ...profiles,
      [role]: updatedRoleProfile,
    };
    saveProfiles(nextProfiles);
  };

  const toggleConnectedAccount = (role: Role, platform: keyof ConnectedAccountsMap, handle?: string) => {
    const currentAccount = profiles[role].connectedAccounts[platform];
    const isNowConnected = !currentAccount.connected;

    const updatedAccounts: ConnectedAccountsMap = {
      ...profiles[role].connectedAccounts,
      [platform]: {
        connected: isNowConnected,
        handle: isNowConnected ? handle || currentAccount.handle || "connected_user" : "",
        verifiedAt: isNowConnected ? new Date().toLocaleDateString() : undefined,
      },
    };

    updateProfile(role, { connectedAccounts: updatedAccounts });
  };

  const hasProfileSetup = (role: Role) => {
    return Boolean(profiles[role] && profiles[role].name && profiles[role].name.trim().length > 0);
  };

  const currentProfile = profiles[currentRole] || defaultProfiles[currentRole];

  return (
    <UserProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        updateProfile,
        toggleConnectedAccount,
        hasProfileSetup,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}
