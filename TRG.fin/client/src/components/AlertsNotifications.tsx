import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'price' | 'technical' | 'news' | 'pattern';
  symbol: string;
  condition: string;
  value: string;
  status: 'active' | 'triggered' | 'disabled';
  createdAt: string;
  triggeredAt?: string;
  notificationMethod: 'app' | 'email' | 'both';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'system' | 'trade';
  timestamp: string;
  read: boolean;
  relatedSymbol?: string;
}

const AlertsNotifications: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newAlertSymbol, setNewAlertSymbol] = useState('');
  const [newAlertType, setNewAlertType] = useState<'price' | 'technical' | 'news' | 'pattern'>('price');
  const [newAlertCondition, setNewAlertCondition] = useState('above');
  const [newAlertValue, setNewAlertValue] = useState('');
  const [newAlertNotificationMethod, setNewAlertNotificationMethod] = useState<'app' | 'email' | 'both'>('app');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Mock data for alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'price',
        symbol: 'AAPL',
        condition: 'above',
        value: '190.00',
        status: 'active',
        createdAt: '2025-02-28T10:30:00Z',
        notificationMethod: 'both'
      },
      {
        id: '2',
        type: 'technical',
        symbol: 'MSFT',
        condition: 'crosses',
        value: 'RSI(14) above 70',
        status: 'triggered',
        createdAt: '2025-02-27T14:15:00Z',
        triggeredAt: '2025-02-28T09:45:00Z',
        notificationMethod: 'app'
      },
      {
        id: '3',
        type: 'pattern',
        symbol: 'TSLA',
        condition: 'forms',
        value: 'Bullish Engulfing',
        status: 'active',
        createdAt: '2025-02-28T11:20:00Z',
        notificationMethod: 'email'
      },
      {
        id: '4',
        type: 'news',
        symbol: 'AMZN',
        condition: 'contains',
        value: 'earnings',
        status: 'active',
        createdAt: '2025-02-28T08:45:00Z',
        notificationMethod: 'app'
      }
    ];

    // Mock data for notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Price Alert Triggered',
        message: 'MSFT has crossed above $400.00',
        type: 'alert',
        timestamp: '2025-02-28T09:45:00Z',
        read: false,
        relatedSymbol: 'MSFT'
      },
      {
        id: '2',
        title: 'Pattern Detected',
        message: 'Bullish Engulfing pattern detected on NVDA 15-minute chart',
        type: 'alert',
        timestamp: '2025-02-28T08:30:00Z',
        read: false,
        relatedSymbol: 'NVDA'
      },
      {
        id: '3',
        title: 'System Maintenance',
        message: 'The system will undergo maintenance on March 5th from 2:00 AM to 4:00 AM EST',
        type: 'system',
        timestamp: '2025-02-27T12:00:00Z',
        read: true
      },
      {
        id: '4',
        title: 'Trade Executed',
        message: 'Buy order for 10 shares of AAPL executed at $189.50',
        type: 'trade',
        timestamp: '2025-02-27T10:15:00Z',
        read: true,
        relatedSymbol: 'AAPL'
      }
    ];

    setAlerts(mockAlerts);
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleCreateAlert = () => {
    if (!newAlertSymbol || !newAlertValue) return;

    const newAlert: Alert = {
      id: Date.now().toString(),
      type: newAlertType,
      symbol: newAlertSymbol,
      condition: newAlertCondition,
      value: newAlertValue,
      status: 'active',
      createdAt: new Date().toISOString(),
      notificationMethod: newAlertNotificationMethod
    };

    setAlerts([newAlert, ...alerts]);
    
    // Reset form
    setNewAlertSymbol('');
    setNewAlertValue('');
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const handleToggleAlertStatus = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { ...alert, status: alert.status === 'active' ? 'disabled' : 'active' } 
        : alert
    ));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <DollarSign className="w-4 h-4" />;
      case 'technical':
        return <TrendingUp className="w-4 h-4" />;
      case 'pattern':
        return <TrendingDown className="w-4 h-4" />;
      case 'news':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'trade':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'triggered':
        return <Badge variant="destructive">Triggered</Badge>;
      case 'disabled':
        return <Badge variant="outline">Disabled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getConditionOptions = (type: string) => {
    switch (type) {
      case 'price':
        return [
          { value: 'above', label: 'Price Above' },
          { value: 'below', label: 'Price Below' },
          { value: 'percent_change', label: 'Percent Change' },
          { value: 'volume_spike', label: 'Volume Spike' }
        ];
      case 'technical':
        return [
          { value: 'crosses', label: 'Indicator Crosses' },
          { value: 'above', label: 'Indicator Above' },
          { value: 'below', label: 'Indicator Below' },
          { value: 'divergence', label: 'Divergence' }
        ];
      case 'pattern':
        return [
          { value: 'forms', label: 'Pattern Forms' },
          { value: 'completes', label: 'Pattern Completes' }
        ];
      case 'news':
        return [
          { value: 'contains', label: 'Contains Keywords' },
          { value: 'sentiment', label: 'Sentiment Score' }
        ];
      default:
        return [];
    }
  };

  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alerts & Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts">
          <TabsList className="mb-4">
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Create New Alert</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alert-symbol">Symbol</Label>
                  <Select value={newAlertSymbol} onValueChange={setNewAlertSymbol}>
                    <SelectTrigger id="alert-symbol">
                      <SelectValue placeholder="Select symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularSymbols.map(symbol => (
                        <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="alert-type">Alert Type</Label>
                  <Select value={newAlertType} onValueChange={(value: 'price' | 'technical' | 'news' | 'pattern') => setNewAlertType(value)}>
                    <SelectTrigger id="alert-type">
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price Alert</SelectItem>
                      <SelectItem value="technical">Technical Indicator</SelectItem>
                      <SelectItem value="pattern">Chart Pattern</SelectItem>
                      <SelectItem value="news">News Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="alert-condition">Condition</Label>
                  <Select value={newAlertCondition} onValueChange={setNewAlertCondition}>
                    <SelectTrigger id="alert-condition">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {getConditionOptions(newAlertType).map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="alert-value">Value</Label>
                  <Input
                    id="alert-value"
                    placeholder={newAlertType === 'price' ? 'Enter price...' : 'Enter value...'}
                    value={newAlertValue}
                    onChange={(e) => setNewAlertValue(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notification-method">Notification Method</Label>
                  <Select 
                    value={newAlertNotificationMethod} 
                    onValueChange={(value: 'app' | 'email' | 'both') => setNewAlertNotificationMethod(value)}
                  >
                    <SelectTrigger id="notification-method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app">App Only</SelectItem>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="both">App & Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={handleCreateAlert} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </div>
            </Card>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Alerts</h3>
                <Badge variant="outline">{alerts.length} Total</Badge>
              </div>
              
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2" />
                  <p>No alerts created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <Card key={alert.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            alert.status === 'active' ? 'bg-primary/10' : 
                            alert.status === 'triggered' ? 'bg-red-500/10' : 
                            'bg-muted/50'
                          }`}>
                            {getAlertTypeIcon(alert.type)}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{alert.symbol}</h4>
                              {getAlertStatusBadge(alert.status)}
                            </div>
                            
                            <p className="text-sm mt-1">
                              {alert.type === 'price' && `Price ${alert.condition} $${alert.value}`}
                              {alert.type === 'technical' && `${alert.value}`}
                              {alert.type === 'pattern' && `${alert.value} pattern ${alert.condition}`}
                              {alert.type === 'news' && `News ${alert.condition} "${alert.value}"`}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Created: {formatDate(alert.createdAt)}
                              </span>
                              
                              {alert.triggeredAt && (
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Triggered: {formatDate(alert.triggeredAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleAlertStatus(alert.id)}
                          >
                            {alert.status === 'active' ? (
                              <XCircle className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Notifications</h3>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All as Read
              </Button>
            </div>
            
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <Card 
                    key={notification.id} 
                    className={`p-4 ${!notification.read ? 'bg-accent/10' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-accent/10">
                          {getNotificationTypeIcon(notification.type)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm mt-1">{notification.message}</p>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{formatDate(notification.timestamp)}</span>
                            
                            {notification.relatedSymbol && (
                              <Badge variant="outline" className="text-xs">
                                {notification.relatedSymbol}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts in the app</p>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound-alerts" className="font-medium">Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Play sound when alerts trigger</p>
                  </div>
                  <Switch 
                    id="sound-alerts" 
                    checked={soundAlerts} 
                    onCheckedChange={setSoundAlerts} 
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Alert Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="price-threshold">Price Alert Threshold (%)</Label>
                  <Input id="price-threshold" type="number" defaultValue="1.0" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum price movement to trigger alerts
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="alert-frequency">Alert Frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger id="alert-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    How often you want to receive alert notifications
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="quiet-start" className="text-xs">Start</Label>
                      <Input id="quiet-start" type="time" defaultValue="22:00" />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end" className="text-xs">End</Label>
                      <Input id="quiet-end" type="time" defaultValue="08:00" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Don't send notifications during these hours
                  </p>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AlertsNotifications; 