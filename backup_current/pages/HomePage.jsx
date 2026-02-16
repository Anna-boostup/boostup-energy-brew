import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/common/Hero';
import Mission from '../components/common/Mission';
import ProductSelection from '../components/products/ProductSelection';
import ThreeBConcept from '../components/common/ThreeBConcept';
import Newsletter from '../components/common/Newsletter';
import Contact from '../components/common/Contact';

const HomePage = () => {
    return (
        <Layout>
            <Hero />
            <Mission />
            <ProductSelection />
            <ThreeBConcept />
            <Newsletter />
            <Contact />
        </Layout>
    );
};

export default HomePage;
