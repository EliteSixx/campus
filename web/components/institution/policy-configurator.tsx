"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PlacementPolicy } from "@/data/institution/types";

interface PolicyConfiguratorProps {
  policy: PlacementPolicy;
  onPolicyChange: (newPolicy: PlacementPolicy) => void;
}

export function PolicyConfigurator({ policy, onPolicyChange }: PolicyConfiguratorProps) {
  const handleChange = (key: keyof PlacementPolicy, value: string | number) => {
    onPolicyChange({ ...policy, [key]: Number(value) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Placement Rules</CardTitle>
        <CardDescription>Adjust institutional eligibility rules. Changes reflect immediately in the matrix.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Minimum CGPA</label>
            <Input 
              type="number" 
              step="0.1" 
              min="0" 
              max="10" 
              value={policy.minCgpa} 
              onChange={(e) => handleChange("minCgpa", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Max Active Backlogs</label>
            <Input 
              type="number" 
              min="0" 
              max="10" 
              value={policy.maxActiveBacklogs} 
              onChange={(e) => handleChange("maxActiveBacklogs", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Max Offers Allowed</label>
            <Select 
              value={String(policy.maxOffersPerStudent)} 
              onChange={(e) => handleChange("maxOffersPerStudent", e.target.value)}
            >
              <option value="1">1 (Single Offer)</option>
              <option value="2">2 (Multiple Offers)</option>
              <option value="3">3 (Dream Status)</option>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
