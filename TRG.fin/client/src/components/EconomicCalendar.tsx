import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, Globe, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  previous: string;
  forecast: string;
  actual?: string;
  currency: string;
  category: string;
}

const EconomicCalendar: React.FC = () => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US', 'EU', 'UK', 'JP']);
  const [impactFilter, setImpactFilter] = useState<string[]>(['high', 'medium', 'low']);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [selectedDate, selectedCountries, impactFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockEvents: EconomicEvent[] = [
        {
          id: '1',
          title: 'Non-Farm Payrolls',
          country: 'US',
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: '12:30 GMT',
          impact: 'high',
          previous: '236K',
          forecast: '245K',
          actual: '275K',
          currency: 'USD',
          category: 'Employment'
        },
        {
          id: '2',
          title: 'ECB Interest Rate Decision',
          country: 'EU',
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: '11:45 GMT',
          impact: 'high',
          previous: '4.50%',
          forecast: '4.50%',
          currency: 'EUR',
          category: 'Central Bank'
        },
        {
          id: '3',
          title: 'UK GDP (QoQ)',
          country: 'UK',
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: '06:00 GMT',
          impact: 'medium',
          previous: '0.2%',
          forecast: '0.3%',
          actual: '0.4%',
          currency: 'GBP',
          category: 'GDP'
        },
        {
          id: '4',
          title: 'Japan Trade Balance',
          country: 'JP',
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: '23:50 GMT',
          impact: 'medium',
          previous: '-78.7B',
          forecast: '-65.2B',
          currency: 'JPY',
          category: 'Trade'
        },
        {
          id: '5',
          title: 'US CPI (MoM)',
          country: 'US',
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: '12:30 GMT',
          impact: 'high',
          previous: '0.3%',
          forecast: '0.2%',
          currency: 'USD',
          category: 'Inflation'
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching economic events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Impact</Badge>;
      default:
        return <Badge variant="outline">Low Impact</Badge>;
    }
  };

  const getCountryFlag = (country: string) => {
    return `https://flagcdn.com/24x18/${country.toLowerCase()}.png`;
  };

  const filteredEvents = events.filter(event => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.country.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'EU', name: 'European Union' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'CH', name: 'Switzerland' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Economic Calendar
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Filter by Country</h3>
            <div className="space-y-2">
              {countries.map(country => (
                <div key={country.code} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={country.code}
                    checked={selectedCountries.includes(country.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCountries([...selectedCountries, country.code]);
                      } else {
                        setSelectedCountries(selectedCountries.filter(c => c !== country.code));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <img
                    src={getCountryFlag(country.code)}
                    alt={country.name}
                    className="w-6 h-4"
                  />
                  <label htmlFor={country.code} className="text-sm">
                    {country.name}
                  </label>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Impact Filter</h3>
            <div className="space-y-2">
              {['high', 'medium', 'low'].map(impact => (
                <div key={impact} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={impact}
                    checked={impactFilter.includes(impact)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setImpactFilter([...impactFilter, impact]);
                      } else {
                        setImpactFilter(impactFilter.filter(i => i !== impact));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={impact} className="capitalize text-sm">
                    {impact} Impact
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <p>No economic events found for the selected criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <Card key={event.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={getCountryFlag(event.country)}
                        alt={event.country}
                        className="w-6 h-4"
                      />
                      <h3 className="font-semibold">{event.title}</h3>
                      {getImpactBadge(event.impact)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {event.currency}
                      </span>
                      <span>{event.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-muted-foreground">Previous</div>
                        <div className="font-mono">{event.previous}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Forecast</div>
                        <div className="font-mono">{event.forecast}</div>
                      </div>
                      {event.actual && (
                        <div>
                          <div className="text-xs text-muted-foreground">Actual</div>
                          <div className={`font-mono ${
                            parseFloat(event.actual) > parseFloat(event.forecast)
                              ? 'text-green-500'
                              : parseFloat(event.actual) < parseFloat(event.forecast)
                              ? 'text-red-500'
                              : ''
                          }`}>
                            {event.actual}
                          </div>
                        </div>
                      )}
                    </div>

                    {event.actual && (
                      <div className="flex justify-end mt-2">
                        {parseFloat(event.actual) > parseFloat(event.forecast) ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Better than expected
                          </Badge>
                        ) : parseFloat(event.actual) < parseFloat(event.forecast) ? (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Worse than expected
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            As expected
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EconomicCalendar; 