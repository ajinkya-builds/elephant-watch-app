import React, { useCallback, useMemo } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import debounce from 'lodash/debounce';

export function ObservationTypeStep() {
  const { formData, setFormData } = useActivityForm();

  const handleObservationTypeChange = useCallback((type: 'direct' | 'indirect' | 'loss') => {
    setFormData({
      ...formData,
      observation_type: type,
      // Reset fields from other observation types
      total_elephants: undefined,
      male_elephants: undefined,
      female_elephants: undefined,
      unknown_elephants: undefined,
      calves: undefined,
      indirect_sighting_type: undefined,
      loss_type: undefined,
    });
  }, [formData, setFormData]);

  // Debounced handlers for number inputs
  const debouncedSetFormData = useMemo(
    () => debounce((updates: Partial<typeof formData>) => {
      setFormData(updates);
    }, 300),
    [setFormData]
  );

  const handleNumberChange = useCallback((field: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      debouncedSetFormData({ [field]: num });
    }
  }, [debouncedSetFormData]);

  const handleSelectChange = useCallback((field: string, value: string) => {
    setFormData({ [field]: value });
  }, [setFormData]);

  return (
    <div className="space-y-6">
      <RadioGroup
        value={formData.observation_type}
        onValueChange={(value: 'direct' | 'indirect' | 'loss') => handleObservationTypeChange(value)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Label
          htmlFor="direct"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
            ${formData.observation_type === 'direct' ? 'border-green-600 bg-green-50' : 'border-gray-200'}
          `}
        >
          <RadioGroupItem value="direct" id="direct" className="sr-only" />
          <span className="text-lg font-semibold">Direct Sighting</span>
        </Label>

        <Label
          htmlFor="indirect"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
            ${formData.observation_type === 'indirect' ? 'border-green-600 bg-green-50' : 'border-gray-200'}
          `}
        >
          <RadioGroupItem value="indirect" id="indirect" className="sr-only" />
          <span className="text-lg font-semibold">Indirect Sighting</span>
        </Label>

        <Label
          htmlFor="loss"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
            ${formData.observation_type === 'loss' ? 'border-green-600 bg-green-50' : 'border-gray-200'}
          `}
        >
          <RadioGroupItem value="loss" id="loss" className="sr-only" />
          <span className="text-lg font-semibold">Loss by Elephant</span>
        </Label>
      </RadioGroup>

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

      {formData.observation_type === 'indirect' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="indirect_sighting_type">Type of Indirect Sighting</Label>
              <Select
                value={formData.indirect_sighting_type}
                onValueChange={(value) => handleSelectChange('indirect_sighting_type', value)}
              >
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select type of indirect sighting" />
                </SelectTrigger>
                <SelectContent 
                  position="popper" 
                  className="w-full z-[100] max-h-[300px] overflow-y-auto"
                  sideOffset={5}
                  align="start"
                >
                  <SelectItem value="Pugmark" className="text-base py-3">Pugmark</SelectItem>
                  <SelectItem value="Dung" className="text-base py-3">Dung</SelectItem>
                  <SelectItem value="Broken Branches" className="text-base py-3">Broken Branches</SelectItem>
                  <SelectItem value="Sound" className="text-base py-3">Sound</SelectItem>
                  <SelectItem value="Eyewitness" className="text-base py-3">Eyewitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.observation_type === 'loss' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="loss_type">Type of Loss</Label>
              <Select
                value={formData.loss_type}
                onValueChange={(value) => handleSelectChange('loss_type', value)}
              >
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select type of loss" />
                </SelectTrigger>
                <SelectContent 
                  position="popper" 
                  className="w-full z-[100] max-h-[300px] overflow-y-auto"
                  sideOffset={5}
                  align="start"
                >
                  <SelectItem value="No loss" className="text-base py-3">No loss</SelectItem>
                  <SelectItem value="crop" className="text-base py-3">Crop</SelectItem>
                  <SelectItem value="livestock" className="text-base py-3">Livestock</SelectItem>
                  <SelectItem value="property" className="text-base py-3">Property</SelectItem>
                  <SelectItem value="fencing" className="text-base py-3">Fencing</SelectItem>
                  <SelectItem value="solar panels" className="text-base py-3">Solar Panels</SelectItem>
                  <SelectItem value="FD establishment" className="text-base py-3">FD Establishment</SelectItem>
                  <SelectItem value="Other" className="text-base py-3">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 