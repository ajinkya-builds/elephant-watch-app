import React, { useCallback, useMemo } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import debounce from 'lodash/debounce';



import { ObservationType, IndirectSightingType, LossType } from '@/types/activity-report';

const observationTypes: { value: ObservationType; label: string }[] = [
  { value: 'direct', label: 'Direct Sighting' },
  { value: 'indirect', label: 'Indirect Sighting' },
  { value: 'loss', label: 'Loss Report' }
];

const indirectSightingTypes: { value: IndirectSightingType; label: string }[] = [
  { value: 'Pugmark', label: 'Pugmark' },
  { value: 'Dung', label: 'Dung' },
  { value: 'Broken Branches', label: 'Broken Branches' },
  { value: 'Sound', label: 'Sound' },
  { value: 'Eyewitness', label: 'Eyewitness' }
];

const lossTypes: { value: LossType; label: string }[] = [
  { value: 'No loss', label: 'No Loss' },
  { value: 'crop', label: 'Crop Damage' },
  { value: 'livestock', label: 'Livestock Loss' },
  { value: 'property', label: 'Property Damage' },
  { value: 'fencing', label: 'Fencing Damage' },
  { value: 'solar panels', label: 'Solar Panel Damage' },
  { value: 'FD establishment', label: 'FD Establishment Damage' },
  { value: 'Other', label: 'Other Loss' }
];

export const ObservationTypeStep: React.FC = () => {
  const { formData, updateFormData } = useActivityForm();

  const handleObservationTypeChange = (value: ObservationType) => {
    updateFormData({ observation_type: value });
  };

  // Debounced handlers for number inputs
  const debouncedSetFormData = useMemo(
    () => debounce((updates: Partial<typeof formData>) => {
      updateFormData(updates);
    }, 300),
    [updateFormData]
  );

  const handleNumberChange = useCallback((field: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      debouncedSetFormData({ [field]: num });
    }
  }, [debouncedSetFormData]);

  const handleSelectChange = useCallback((field: string, value: string) => {
    updateFormData({ [field]: value });
  }, [updateFormData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label>Type of Observation</Label>
              <RadioGroup
                value={formData.observation_type}
                onValueChange={handleObservationTypeChange}
                className="mt-2"
              >
                {observationTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value}>{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {formData.observation_type === 'indirect' && (
  <div>
    <Label>Indirect Sighting Type</Label>
    <Select
      value={formData.indirect_sighting_type || ''}
      onValueChange={value => handleSelectChange('indirect_sighting_type', value)}
    >
      <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm hover:border-blue-500 transition-colors">
        <SelectValue placeholder="Select type of indirect sighting" />
      </SelectTrigger>
      <SelectContent>
        {indirectSightingTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}

            {formData.observation_type === 'loss' && (
  <div>
    <Label>Loss Type</Label>
    <Select
      value={formData.loss_type || ''}
      onValueChange={value => handleSelectChange('loss_type', value)}
    >
      <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm hover:border-blue-500 transition-colors">
        <SelectValue placeholder="Select type of loss" />
      </SelectTrigger>
      <SelectContent>
        {lossTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
          </div>
        </CardContent>
      </Card>

      {formData.observation_type === 'direct' && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_elephants">Total Elephants</Label>
                <Input
                  type="number"
                  id="total_elephants"
                  min="0"
                  value={formData.total_elephants || ''}
                  onChange={(e) => handleNumberChange('total_elephants', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="male_elephants">Male Elephants</Label>
                <Input
                  type="number"
                  id="male_elephants"
                  min="0"
                  value={formData.male_elephants || ''}
                  onChange={(e) => handleNumberChange('male_elephants', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="female_elephants">Female Elephants</Label>
                <Input
                  type="number"
                  id="female_elephants"
                  min="0"
                  value={formData.female_elephants || ''}
                  onChange={(e) => handleNumberChange('female_elephants', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unknown_elephants">Unknown Elephants</Label>
                <Input
                  type="number"
                  id="unknown_elephants"
                  min="0"
                  value={formData.unknown_elephants || ''}
                  onChange={(e) => handleNumberChange('unknown_elephants', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calves">Calves</Label>
                <Input
                  type="number"
                  id="calves"
                  min="0"
                  value={formData.calves || ''}
                  onChange={(e) => handleNumberChange('calves', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      

      
    </div>
  );
}; 