import type { Startup } from '../types';

export const startupsMaster: Startup[] = [
    // ═══════════════════════════════════════════════════════════════
    // INDUSTRIAL TECH & ROBOTICS
    // ═══════════════════════════════════════════════════════════════
    { id: 'helsing', name: 'Helsing', funding: 4500, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Defense AI', runway: 'Safe', burnRate: 1000, description: 'Defense AI for national security.', founded: 2021, rounds: [{ date: '2024-07-01', amount: 694, series: 'D' }], url: 'https://helsing.ai' },
    { id: 'agile-robots', name: 'Agile Robots', funding: 1200, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Robotics', runway: 'Safe', burnRate: 500, description: 'Intelligent robotic systems.', founded: 2018, rounds: [], url: 'https://agile-robots.com' },
    { id: 'isar-aerospace', name: 'Isar Aerospace', funding: 800, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Space', runway: 'Safe', burnRate: 400, description: 'Launch vehicles for small satellites.', founded: 2018, rounds: [], url: 'https://isaraerospace.com' },
    { id: 'quantum-systems', name: 'Quantum Systems', funding: 450, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Drones/Defense', runway: 'Safe', burnRate: 200, description: 'Autonomous flight systems.', founded: 2015, rounds: [], url: 'https://quantum-systems.com' },
    { id: 'wandelbots', name: 'Wandelbots', funding: 400, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Robotics Software', runway: 'Safe', burnRate: 150, description: 'No-code robotics.', founded: 2017, rounds: [], url: 'https://wandelbots.com' },
    { id: 'konux', name: 'Konux', funding: 250, district: 'Mitte', sector: 'Industrial Tech', vertical: 'IIoT/Rail', runway: 'Safe', burnRate: 100, description: 'Infrastructure monitoring.', founded: 2014, rounds: [], url: 'https://konux.com' },
    { id: 'rfa', name: 'RFA', funding: 200, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Space', runway: 'Safe', burnRate: 100, description: 'Rocket Factory Augsburg.', founded: 2018, rounds: [], url: 'https://rfa.space' },
    { id: 'blickfeld', name: 'Blickfeld', funding: 200, district: 'Mitte', sector: 'Industrial Tech', vertical: 'LiDAR', runway: 'Safe', burnRate: 80, description: 'Solid-state LiDAR.', founded: 2017, rounds: [], url: 'https://blickfeld.com' },
    { id: 'skeleton-tech', name: 'Skeleton Tech', funding: 200, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Supercaps', runway: 'Safe', burnRate: 80, description: 'Energy storage.', founded: 2009, rounds: [], url: 'https://skeletontech.com' },
    { id: 'magazino', name: 'Magazino', funding: 150, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Robotics Logistics', runway: 'Safe', burnRate: 50, description: 'Logistics robots.', founded: 2014, rounds: [], url: 'https://magazino.eu' },
    { id: 'instagrid', name: 'Instagrid', funding: 150, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Portable Power', runway: 'Safe', burnRate: 50, description: 'Portable power systems.', founded: 2018, rounds: [], url: 'https://instagrid.co' },
    { id: 'cylib', name: 'Cylib', funding: 150, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Battery Recycling', runway: 'Safe', burnRate: 40, description: 'Sustainable recycling.', founded: 2022, rounds: [], url: 'https://cylib.de' },
    { id: 'maus', name: 'Maus (Micropsi)', funding: 120, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Robotics AI', runway: 'Safe', burnRate: 30, description: 'AI control for robots.', founded: 2014, rounds: [], url: 'https://maus-ai.com' },
    { id: 'twaice', name: 'TWAICE', funding: 100, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Battery Analytics', runway: 'Safe', burnRate: 30, description: 'Battery twins.', founded: 2018, rounds: [], url: 'https://twaice.com' },
    { id: 'german-bionic', name: 'German Bionic', funding: 100, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Exoskeletons', runway: 'Safe', burnRate: 20, description: 'Wearable robotics.', founded: 2017, rounds: [], url: 'https://germanbionic.com' },
    { id: 'marvel-fusion', name: 'Marvel Fusion', funding: 100, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Fusion Energy', runway: 'Safe', burnRate: 50, description: 'Clean energy.', founded: 2019, rounds: [], url: 'https://marvelfusion.com' },
    { id: 'daedalus', name: 'Daedalus', funding: 90, district: 'Mitte', sector: 'Industrial Tech', vertical: 'AI Manufacturing', runway: 'Safe', burnRate: 20, description: 'Precision mfg.', founded: 2019, rounds: [], url: 'https://daedalus.de' },
    { id: 'accure', name: 'Accure', funding: 80, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Battery Intelligence', runway: 'Safe', burnRate: 20, description: 'Battery safety.', founded: 2020, rounds: [], url: 'https://accure.net' },
    { id: 'arx-robotics', name: 'ARX Robotics', funding: 80, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Defense Robotics', runway: 'Safe', burnRate: 20, description: 'Modular UGVs.', founded: 2021, rounds: [], url: 'https://arx-robotics.com' },
    { id: 'proxima-fusion', name: 'Proxima Fusion', funding: 60, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Fusion Energy', runway: 'Safe', burnRate: 20, description: 'Stellarator tech.', founded: 2023, rounds: [], url: 'https://proximafusion.com' },
    { id: 'ororatech', name: 'OroraTech', funding: 60, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Wildfire Monitor', runway: 'Safe', burnRate: 15, description: 'Satellite fire intel.', founded: 2018, rounds: [], url: 'https://ororatech.com' },
    { id: 'liveeo', name: 'LiveEO', funding: 50, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Satellite Analytics', runway: 'Safe', burnRate: 15, description: 'Infrastructure monitoring.', founded: 2018, rounds: [], url: 'https://liveeo.com' },
    { id: 'saxonq', name: 'SaxonQ', funding: 50, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Quantum Computing', runway: 'Safe', burnRate: 15, description: 'Hardware.', founded: 2021, rounds: [] },
    { id: 'morpheus-space', name: 'Morpheus Space', funding: 50, district: 'Mitte', sector: 'Industrial Tech', vertical: 'Space Propulsion', runway: 'Safe', burnRate: 10, description: 'Propulsion.', founded: 2018, rounds: [] },

    // ═══════════════════════════════════════════════════════════════
    // STANDARD TECH
    // ═══════════════════════════════════════════════════════════════
    { id: 'n26', name: 'N26', funding: 8500, district: 'Mitte', sector: 'Standard Tech', vertical: 'Fintech', runway: 'Safe', burnRate: 2000, description: 'Digital banking.', founded: 2013, rounds: [], url: 'https://n26.com' },
    { id: 'personio', name: 'Personio', funding: 8000, district: 'Mitte', sector: 'Standard Tech', vertical: 'HR Tech', runway: 'Safe', burnRate: 1500, description: 'HR OS.', founded: 2015, rounds: [], url: 'https://personio.com' },
    { id: 'sumup', name: 'SumUp', funding: 8000, district: 'Mitte', sector: 'Standard Tech', vertical: 'Payments', runway: 'Safe', burnRate: 1500, description: 'POS systems.', founded: 2012, rounds: [], url: 'https://sumup.com' },
    { id: 'trade-republic', name: 'Trade Republic', funding: 6000, district: 'Mitte', sector: 'Standard Tech', vertical: 'Fintech', runway: 'Safe', burnRate: 1000, description: 'Mobile broker.', founded: 2015, rounds: [], url: 'https://traderepublic.com' },
    { id: 'mambu', name: 'Mambu', funding: 4000, district: 'Mitte', sector: 'Standard Tech', vertical: 'Core Banking', runway: 'Safe', burnRate: 800, description: 'SaaS banking.', founded: 2011, rounds: [], url: 'https://mambu.com' },
    { id: 'contentful', name: 'Contentful', funding: 3000, district: 'Kreuzberg', sector: 'Standard Tech', vertical: 'Headless CMS', runway: 'Safe', burnRate: 600, description: 'Content platform.', founded: 2013, rounds: [], url: 'https://contentful.com' },
    { id: 'raisin', name: 'Raisin', funding: 2000, district: 'Mitte', sector: 'Standard Tech', vertical: 'Fintech', runway: 'Safe', burnRate: 400, description: 'Open banking.', founded: 2012, rounds: [], url: 'https://raisin.com' },
    { id: 'solaris', name: 'Solaris', funding: 1600, district: 'Mitte', sector: 'Standard Tech', vertical: 'BaaS', runway: 'Safe', burnRate: 300, description: 'Banking APIs.', founded: 2016, rounds: [], url: 'https://solarisgroup.com' },
    { id: 'razor-group', name: 'Razor Group', funding: 1200, district: 'Mitte', sector: 'Standard Tech', vertical: 'E-commerce', runway: 'Safe', burnRate: 200, description: 'Aggregator.', founded: 2020, rounds: [] },
    { id: 'sellerx', name: 'SellerX', funding: 1000, district: 'Mitte', sector: 'Standard Tech', vertical: 'E-com Aggregator', runway: 'Safe', burnRate: 200, description: 'Acquisitions.', founded: 2020, rounds: [] },
    { id: 'safe-gnosis', name: 'Safe (Gnosis)', funding: 1000, district: 'Kreuzberg', sector: 'Standard Tech', vertical: 'Crypto Infra', runway: 'Safe', burnRate: 300, description: 'Web3 storage.', founded: 2015, rounds: [] },
    { id: 'taxfix', name: 'Taxfix', funding: 1000, district: 'Mitte', sector: 'Standard Tech', vertical: 'Fintech', runway: 'Safe', burnRate: 200, description: 'Tax software.', founded: 2016, rounds: [] },
    { id: 'bbg', name: 'BBG (Berlin Brands Group)', funding: 1000, district: 'Mitte', sector: 'Standard Tech', vertical: 'E-com', runway: 'Safe', burnRate: 400, description: 'Brand engine.', founded: 2005, rounds: [] },
    { id: 'grover', name: 'Grover', funding: 1000, district: 'Kreuzberg', sector: 'Standard Tech', vertical: 'Tech Rental', runway: 'Safe', burnRate: 200, description: 'Circular tech.', founded: 2015, rounds: [] },
    { id: 'vivid-money', name: 'Vivid Money', funding: 700, district: 'Mitte', sector: 'Standard Tech', vertical: 'Neobank', runway: 'Safe', burnRate: 150, description: 'Fin super app.', founded: 2020, rounds: [] },
    { id: 'billie', name: 'Billie', funding: 600, district: 'Mitte', sector: 'Standard Tech', vertical: 'BNPL', runway: 'Safe', burnRate: 100, description: 'B2B payments.', founded: 2016, rounds: [] },
    { id: 'moonfare', name: 'Moonfare', funding: 600, district: 'Mitte', sector: 'Standard Tech', vertical: 'Private Equity', runway: 'Safe', burnRate: 100, description: 'PE investing.', founded: 2016, rounds: [] },
    { id: 'anydesk', name: 'AnyDesk', funding: 600, district: 'Mitte', sector: 'Standard Tech', vertical: 'Remote Access', runway: 'Safe', burnRate: 50, description: 'Remote desktop.', founded: 2014, rounds: [] },
    { id: 'moss', name: 'Moss', funding: 500, district: 'Mitte', sector: 'Standard Tech', vertical: 'Fintech', runway: 'Safe', burnRate: 100, description: 'Spend mgmt.', founded: 2019, rounds: [] },
    { id: 'upvest', name: 'Upvest', funding: 450, district: 'Mitte', sector: 'Standard Tech', vertical: 'Fintech Infra', runway: 'Safe', burnRate: 80, description: 'Investment API.', founded: 2017, rounds: [] },
    { id: 'camunda', name: 'Camunda', funding: 400, district: 'Kreuzberg', sector: 'Standard Tech', vertical: 'Process Automation', runway: 'Safe', burnRate: 60, description: 'Orchestration.', founded: 2008, rounds: [] },
    { id: 'rasa', name: 'Rasa', funding: 250, district: 'Mitte', sector: 'Standard Tech', vertical: 'Conversational AI', runway: 'Safe', burnRate: 40, description: 'Open source NLP.', founded: 2016, rounds: [] },
    { id: 'everphone', name: 'Everphone', funding: 250, district: 'Mitte', sector: 'Standard Tech', vertical: 'Device as Service', runway: 'Safe', burnRate: 50, description: 'Enterprise mobile.', founded: 2016, rounds: [] },

    // ═══════════════════════════════════════════════════════════════
    // MOBILITY & LOGISTICS
    // ═══════════════════════════════════════════════════════════════
    { id: 'flix', name: 'Flix', funding: 3000, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Transport', runway: 'Safe', burnRate: 1000, description: 'Green mobility.', founded: 2013, rounds: [], url: 'https://flix.com' },
    { id: 'forto', name: 'Forto', funding: 2100, district: 'Kreuzberg', sector: 'Mobility & Logistics', vertical: 'Digital Freight', runway: 'Safe', burnRate: 500, description: 'Digital forwarding.', founded: 2016, rounds: [], url: 'https://forto.com' },
    { id: 'sennder', name: 'Sennder', funding: 1800, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Digital Freight', runway: 'Safe', burnRate: 400, description: 'Road freight.', founded: 2015, rounds: [], url: 'https://sennder.com' },
    { id: 'volocopter', name: 'Volocopter', funding: 1500, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'UAM', runway: 'Safe', burnRate: 300, description: 'Electric air taxis.', founded: 2011, rounds: [], url: 'https://volocopter.com' },
    { id: 'tier', name: 'Tier Mobility', funding: 1000, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Micromobility', runway: 'Safe', burnRate: 600, description: 'Shared scooters.', founded: 2018, rounds: [], url: 'https://tier.app' },
    { id: 'omio', name: 'Omio', funding: 800, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Travel Aggregator', runway: 'Safe', burnRate: 200, description: 'Search & book.', founded: 2013, rounds: [], url: 'https://omio.com' },
    { id: 'blacklane', name: 'Blacklane', funding: 400, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Premium Mobility', runway: 'Safe', burnRate: 100, description: 'Chauffeur service.', founded: 2011, rounds: [] },
    { id: 'cargo-one', name: 'Cargo.one', funding: 400, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Air Freight', runway: 'Safe', burnRate: 80, description: 'Digital booking.', founded: 2017, rounds: [] },
    { id: 'vay', name: 'Vay', funding: 300, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Teledriving', runway: 'Safe', burnRate: 50, description: 'Remote driving.', founded: 2018, rounds: [] },
    { id: 'miles-mobility', name: 'Miles Mobility', funding: 300, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Car Sharing', runway: 'Safe', burnRate: 150, description: 'Kilometer-based.', founded: 2016, rounds: [] },
    { id: 'dronamics', name: 'Dronamics', funding: 150, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'Cargo Drones', runway: 'Safe', burnRate: 30, description: 'Delivery drones.', founded: 2014, rounds: [] },
    { id: 'h2-mobility', name: 'H2 Mobility', funding: 150, district: 'Mitte', sector: 'Mobility & Logistics', vertical: 'H2 Infra', runway: 'Safe', burnRate: 20, description: 'Hydrogen network.', founded: 2015, rounds: [] },

    // ═══════════════════════════════════════════════════════════════
    // BUILT WORLD
    // ═══════════════════════════════════════════════════════════════
    { id: 'enpal', name: 'Enpal', funding: 4200, district: 'Friedrichshain', sector: 'Built World', vertical: 'Energy Tech', runway: 'Safe', burnRate: 1500, description: 'Home solar.', founded: 2017, rounds: [], url: 'https://enpal.de' },
    { id: '1komma5', name: '1Komma5°', funding: 1500, district: 'Mitte', sector: 'Built World', vertical: 'Energy Tech', runway: 'Safe', burnRate: 500, description: 'Smart energy.', founded: 2021, rounds: [], url: 'https://1komma5grad.com' },
    { id: 'sunfire', name: 'Sunfire', funding: 1000, district: 'Mitte', sector: 'Built World', vertical: 'Hydrogen', runway: 'Safe', burnRate: 400, description: 'Electrolyzers.', founded: 2010, rounds: [], url: 'https://sunfire.de' },
    { id: 'thermondo', name: 'Thermondo', funding: 400, district: 'Mitte', sector: 'Built World', vertical: 'Energy Services', runway: 'Safe', burnRate: 100, description: 'Heat pumps.', founded: 2012, rounds: [] },
    { id: 'mcmakler', name: 'McMakler', funding: 400, district: 'Mitte', sector: 'Built World', vertical: 'PropTech', runway: 'Safe', burnRate: 200, description: 'Modern broker.', founded: 2015, rounds: [] },
    { id: 'habyt', name: 'Habyt', funding: 300, district: 'Mitte', sector: 'Built World', vertical: 'Co-living', runway: 'Safe', burnRate: 150, description: 'Housing.', founded: 2017, rounds: [] },
    { id: 'gropyus', name: 'Gropyus', funding: 300, district: 'Mitte', sector: 'Built World', vertical: 'Modular Con', runway: 'Safe', burnRate: 100, description: 'Prefab living.', founded: 2019, rounds: [] },
    { id: 'planradar', name: 'PlanRadar', funding: 300, district: 'Mitte', sector: 'Built World', vertical: 'ConTech', runway: 'Safe', burnRate: 60, description: 'Construction software.', founded: 2013, rounds: [] },
    { id: 'zolar', name: 'Zolar', funding: 250, district: 'Mitte', sector: 'Built World', vertical: 'Solar', runway: 'Safe', burnRate: 80, description: 'Digital solar.', founded: 2016, rounds: [] },
    { id: 'tado', name: 'Tado', funding: 200, district: 'Mitte', sector: 'Built World', vertical: 'Smart Thermostat', runway: 'Safe', burnRate: 40, description: 'Climate control.', founded: 2011, rounds: [] },

    // ═══════════════════════════════════════════════════════════════
    // CREATIVE ECONOMY
    // ═══════════════════════════════════════════════════════════════
    { id: 'deepl', name: 'DeepL', funding: 2500, district: 'Mitte', sector: 'Creative Economy', vertical: 'AI/Translation', runway: 'Safe', burnRate: 1000, description: 'Translation tech.', founded: 2017, rounds: [], url: 'https://deepl.com' },
    { id: 'getyourguide', name: 'GetYourGuide', funding: 2000, district: 'Prenzlauer Berg', sector: 'Creative Economy', vertical: 'Travel', runway: 'Safe', burnRate: 800, description: 'Travel tours.', founded: 2009, rounds: [], url: 'https://getyourguide.com' },
    { id: 'grover-ce', name: 'Grover', funding: 1100, district: 'Kreuzberg', sector: 'Creative Economy', vertical: 'Circular Electronics', runway: 'Safe', burnRate: 400, description: 'Tech rental.', founded: 2015, rounds: [] },
    { id: 'soundcloud', name: 'SoundCloud', funding: 900, district: 'Mitte', sector: 'Creative Economy', vertical: 'Music Streaming', runway: 'Safe', burnRate: 300, description: 'Global sound platform.', founded: 2007, rounds: [] },
    { id: 'coachhub', name: 'CoachHub', funding: 800, district: 'Mitte', sector: 'Creative Economy', vertical: 'EdTech/HR', runway: 'Safe', burnRate: 150, description: 'Digital coaching.', founded: 2018, rounds: [] },
    { id: 'blackforestlabs', name: 'Black Forest Labs', funding: 500, district: 'Mitte', sector: 'Creative Economy', vertical: 'GenAI/Image', runway: 'Safe', burnRate: 200, description: 'AI images.', founded: 2024, rounds: [] },
    { id: 'babbel', name: 'Babbel', funding: 500, district: 'Mitte', sector: 'Creative Economy', vertical: 'EdTech', runway: 'Safe', burnRate: 150, description: 'Language learning.', founded: 2007, rounds: [] },
    { id: 'pitch', name: 'Pitch', funding: 400, district: 'Mitte', sector: 'Creative Economy', vertical: 'Productivity', runway: 'Safe', burnRate: 60, description: 'Presentations.', founded: 2018, rounds: [] },
    { id: 'urbansports', name: 'Urban Sports Club', funding: 300, district: 'Mitte', sector: 'Creative Economy', vertical: 'Fitness', runway: 'Safe', burnRate: 100, description: 'Aggregator.', founded: 2012, rounds: [] },
    { id: 'parloa', name: 'Parloa', funding: 300, district: 'Mitte', sector: 'Creative Economy', vertical: 'AI Voice', runway: 'Safe', burnRate: 60, description: 'Voice automation.', founded: 2017, rounds: [] },

    // ═══════════════════════════════════════════════════════════════
    // HEALTH & CARE
    // ═══════════════════════════════════════════════════════════════
    { id: 'egym', name: 'Egym', funding: 500, district: 'Mitte', sector: 'Health & Care', vertical: 'Fitness Tech', runway: 'Safe', burnRate: 300, description: 'Smart gym.', founded: 2010, rounds: [] },
    { id: 'caresyntax', name: 'Caresyntax', funding: 400, district: 'Mitte', sector: 'Health & Care', vertical: 'Surgical AI', runway: 'Safe', burnRate: 100, description: 'Safe surgery.', founded: 2013, rounds: [] },
    { id: 'adahealth', name: 'Ada Health', funding: 350, district: 'Mitte', sector: 'Health & Care', vertical: 'AI Diagnostics', runway: 'Safe', burnRate: 80, description: 'Symptom checker.', founded: 2011, rounds: [] },
    { id: 'amboss', name: 'Amboss', funding: 300, district: 'Kreuzberg', sector: 'Health & Care', vertical: 'Med Ed', runway: 'Safe', burnRate: 60, description: 'Knowledge platform.', founded: 2012, rounds: [] },
    { id: 'medwing', name: 'Medwing', funding: 250, district: 'Mitte', sector: 'Health & Care', vertical: 'Health HR', runway: 'Safe', burnRate: 80, description: 'Staffing.', founded: 2017, rounds: [] },
    { id: 'patient21', name: 'Patient21', funding: 200, district: 'Mitte', sector: 'Health & Care', vertical: 'Hybrid Health', runway: 'Safe', burnRate: 150, description: 'Digital clinics.', founded: 2019, rounds: [] },
    { id: 'kaia-health', name: 'Kaia Health', funding: 200, district: 'Mitte', sector: 'Health & Care', vertical: 'DTx MSK', runway: 'Safe', burnRate: 50, description: 'Digital therapy.', founded: 2016, rounds: [] },
    { id: 'freeletics', name: 'Freeletics', funding: 200, district: 'Mitte', sector: 'Health & Care', vertical: 'Fitness App', runway: 'Safe', burnRate: 60, description: 'Bodyweight training.', founded: 2013, rounds: [] },
    { id: 't-knife', name: 'T-Knife', funding: 150, district: 'Mitte', sector: 'Health & Care', vertical: 'Biotech', runway: 'Safe', burnRate: 100, description: 'Cancer therapy.', founded: 2018, rounds: [] },

    // ═══════════════════════════════════════════════════════════════
    // FOOD & AGTECH
    // ═══════════════════════════════════════════════════════════════
    { id: 'choco', name: 'Choco', funding: 1200, district: 'Mitte', sector: 'Food & AgTech', vertical: 'Supply Chain', runway: 'Safe', burnRate: 400, description: 'Restaurant supply.', founded: 2018, rounds: [] },
    { id: 'formo', name: 'Formo', funding: 400, district: 'Mitte', sector: 'Food & AgTech', vertical: 'Alt-Protein', runway: 'Safe', burnRate: 100, description: 'Animal-free dairy.', founded: 2019, rounds: [] },
    { id: 'koro', name: 'KoRo', funding: 300, district: 'Mitte', sector: 'Food & AgTech', vertical: 'E-commerce', runway: 'Safe', burnRate: 80, description: 'Natural food brands.', founded: 2014, rounds: [] },
    { id: 'sunday-natural', name: 'Sunday Natural', funding: 100, district: 'Mitte', sector: 'Food & AgTech', vertical: 'Supplements', runway: 'Safe', burnRate: 50, description: 'Vitamins.', founded: 2013, rounds: [] },
    { id: 'motatos', name: 'Motatos', funding: 80, district: 'Mitte', sector: 'Food & AgTech', vertical: 'Food Rescue', runway: 'Safe', burnRate: 40, description: 'Sustainability.', founded: 2014, rounds: [] },
    { id: 'mushlabs', name: 'MushLabs', funding: 80, district: 'Mitte', sector: 'Food & AgTech', vertical: 'Fermentation', runway: 'Safe', burnRate: 30, description: 'Mushroom protein.', founded: 2018, rounds: [] },
    { id: 'bluu-seafood', name: 'Bluu Seafood', funding: 80, district: 'Mitte', sector: 'Food & AgTech', vertical: 'Cell-Cultured', runway: 'Safe', burnRate: 30, description: 'Cultivated fish.', founded: 2020, rounds: [] },

    // ═══════════════════════════════════════════════════════════════
    // SOCIAL & IMPACT
    // ═══════════════════════════════════════════════════════════════
    { id: 'plan-a-si', name: 'Plan A', funding: 150, district: 'Kreuzberg', sector: 'Social & Impact', vertical: 'Carbon Accounting', runway: 'Safe', burnRate: 30, description: 'ESG platform.', founded: 2017, rounds: [] },
    { id: 'normative-si', name: 'Normative', funding: 80, district: 'Mitte', sector: 'Social & Impact', vertical: 'Carbon Accounting', runway: 'Safe', burnRate: 20, description: 'Emissions tracking.', founded: 2014, rounds: [] },
    { id: 'share', name: 'Share', funding: 50, district: 'Mitte', sector: 'Social & Impact', vertical: 'CPG Impact', runway: 'Safe', burnRate: 30, description: '1-for-1 snacks.', founded: 2017, rounds: [] },
    { id: 'polyteia', name: 'Polyteia', funding: 30, district: 'Mitte', sector: 'Social & Impact', vertical: 'GovTech', runway: 'Safe', burnRate: 10, description: 'Data for govt.', founded: 2017, rounds: [] },
    { id: 'carbo-culture', name: 'Carbo Culture', funding: 30, district: 'Mitte', sector: 'Social & Impact', vertical: 'Carbon Removal', runway: 'Safe', burnRate: 10, description: 'Biochar.', founded: 2017, rounds: [] },
    { id: 'klima', name: 'Klima', funding: 15, district: 'Mitte', sector: 'Social & Impact', vertical: 'Consumer Carbon', runway: 'Safe', burnRate: 5, description: 'CO2 offset app.', founded: 2019, rounds: [] },
    { id: 'climatiq-si', name: 'Climatiq', funding: 15, district: 'Kreuzberg', sector: 'Social & Impact', vertical: 'Carbon Data', runway: 'Safe', burnRate: 5, description: 'Emissions API.', founded: 2021, rounds: [] },
    { id: 'vaayu', name: 'Vaayu', funding: 15, district: 'Mitte', sector: 'Social & Impact', vertical: 'Carbon Retail', runway: 'Safe', burnRate: 5, description: 'Real-time retail CO2.', founded: 2020, rounds: [] },
    { id: 'govmind', name: 'GovMind', funding: 10, district: 'Mitte', sector: 'Social & Impact', vertical: 'GovTech', runway: 'Safe', burnRate: 2, description: 'Public sector intel.', founded: 2019, rounds: [] },
];
