import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Building2, Briefcase, Users, Globe } from 'lucide-react';

const ProfitKingdom = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for demonstration
  const regions = {
    asia: {
      name: 'Asia',
      gdp: '34.55T',
      topCompanies: ['Reliance Industries', 'HDFC Bank', 'TCS'],
      topIndividuals: ['Gautam Adani', 'Mukesh Ambani'],
      sectors: ['IT', 'Manufacturing', 'Finance']
    },
    // Add more regions...
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            Profit Kingdom
          </h1>
          <p className="text-gray-400">Command your economic empire</p>
        </motion.div>

        {/* World Map Section */}
        <div className="relative h-[600px] mb-8 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" />
          {/* Add interactive map regions here */}
          <motion.div
            className="absolute inset-0 grid grid-cols-3 gap-4 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Region Cards */}
            <motion.div
              className="col-span-1 bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Building2 className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold">Industrial Sector</h3>
              <p className="text-sm text-gray-400">Manufacturing empire</p>
            </motion.div>

            <motion.div
              className="col-span-1 bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Briefcase className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold">Financial District</h3>
              <p className="text-sm text-gray-400">Banking & investments</p>
            </motion.div>

            <motion.div
              className="col-span-1 bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold">Global Trade</h3>
              <p className="text-sm text-gray-400">International commerce</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Panel */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Card className="bg-white/10 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Players
            </h3>
            <div className="space-y-2">
              {['Player 1', 'Player 2', 'Player 3'].map((player, index) => (
                <motion.div
                  key={player}
                  className="flex items-center justify-between p-2 bg-white/5 rounded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span>{player}</span>
                  <span className="text-yellow-400">$1.2M</span>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card className="bg-white/10 p-6">
            <h3 className="text-xl font-bold mb-4">Market Status</h3>
            {/* Add market indicators */}
          </Card>

          <Card className="bg-white/10 p-6">
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            {/* Add resource management */}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfitKingdom;
