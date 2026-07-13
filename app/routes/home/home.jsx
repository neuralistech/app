import { Footer } from '~/components/footer';
import { baseMeta } from '~/utils/meta';
import { Intro } from './intro';
import { Profile } from './profile';
import { ProjectSummary } from './project-summary';
import { useEffect, useRef, useState } from 'react';
import config from '~/config.json';
import styles from './home.module.css';

export const links = () => {
  return [
    {
      rel: 'prefetch',
      href: '/draco/draco_wasm_wrapper.js',
      as: 'script',
      type: 'text/javascript',
      importance: 'low',
    },
    {
      rel: 'prefetch',
      href: '/draco/draco_decoder.wasm',
      as: 'fetch',
      type: 'application/wasm',
      importance: 'low',
    },
  ];
};

export const meta = () => {
  return baseMeta({
    title: 'Tech Engineering + BPO + AI',
    description: `${config.tagline} — Soluciones de BPO, Call Center, automatización e infraestructura digital para empresas en crecimiento.`,
  });
};

export const Home = () => {
  const [visibleSections, setVisibleSections] = useState([]);
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const intro = useRef();
  const projectOne = useRef();
  const projectTwo = useRef();
  const projectThree = useRef();
  const details = useRef();

  useEffect(() => {
    const sections = [intro, projectOne, projectTwo, projectThree, details];

    const sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const section = entry.target;
            observer.unobserve(section);
            if (visibleSections.includes(section)) return;
            setVisibleSections(prevSections => [...prevSections, section]);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    const indicatorObserver = new IntersectionObserver(
      ([entry]) => {
        setScrollIndicatorHidden(!entry.isIntersecting);
      },
      { rootMargin: '-100% 0px 0px 0px' }
    );

    sections.forEach(section => {
      sectionObserver.observe(section.current);
    });

    indicatorObserver.observe(intro.current);

    return () => {
      sectionObserver.disconnect();
      indicatorObserver.disconnect();
    };
  }, [visibleSections]);

  return (
    <div className={styles.home}>
      <Intro
        id="intro"
        sectionRef={intro}
        scrollIndicatorHidden={scrollIndicatorHidden}
      />
      <ProjectSummary
        id="project-1"
        sectionRef={projectOne}
        visible={visibleSections.includes(projectOne.current)}
        index={1}
        title="Automatización inteligente de procesos"
        description="Implementamos soluciones de IA y RPA que eliminan tareas repetitivas y liberan a tu equipo para trabajar en lo que importa."
        buttonText="Ver caso de uso"
        buttonLink="/contact"
        model={{
          type: 'laptop',
          alt: 'Dashboard de automatización Neuralis ZEN',
          textures: [
            {
              srcSet: `https://res.cloudinary.com/lur7e7tw/image/upload/w_1280/v1783901944/neuralis/neuralis/projects/zen-dashboard.jpg 1280w, https://res.cloudinary.com/lur7e7tw/image/upload/w_2560/v1783901944/neuralis/neuralis/projects/zen-dashboard.jpg 2560w`,
              placeholder: `https://res.cloudinary.com/lur7e7tw/image/upload/w_20,e_blur:1000/v1783901944/neuralis/neuralis/projects/zen-dashboard.jpg`,
            },
          ],
        }}
      />
      <ProjectSummary
        id="project-2"
        alternate
        sectionRef={projectTwo}
        visible={visibleSections.includes(projectTwo.current)}
        index={2}
        title="Call Center & BPO de alto rendimiento"
        description="Gestión de operaciones de contact center con métricas en tiempo real, calidad garantizada y escalabilidad inmediata."
        buttonText="Conocer más"
        buttonLink="/contact"
        model={{
          type: 'phone',
          alt: 'App de gestión de agentes',
          textures: [
            {
              srcSet: `https://res.cloudinary.com/lur7e7tw/image/upload/w_375/v1783901944/neuralis/neuralis/projects/callcenter-app.jpg 375w, https://res.cloudinary.com/lur7e7tw/image/upload/w_750/v1783901944/neuralis/neuralis/projects/callcenter-app.jpg 750w`,
              placeholder: `https://res.cloudinary.com/lur7e7tw/image/upload/w_20,e_blur:1000/v1783901944/neuralis/neuralis/projects/callcenter-app.jpg`,
            },
            {
              srcSet: `https://res.cloudinary.com/lur7e7tw/image/upload/w_375/v1783901944/neuralis/neuralis/projects/callcenter-app.jpg 375w, https://res.cloudinary.com/lur7e7tw/image/upload/w_750/v1783901944/neuralis/neuralis/projects/callcenter-app.jpg 750w`,
              placeholder: `https://res.cloudinary.com/lur7e7tw/image/upload/w_20,e_blur:1000/v1783901944/neuralis/neuralis/projects/callcenter-app.jpg`,
            },
          ],
        }}
      />
      <ProjectSummary
        id="project-3"
        sectionRef={projectThree}
        visible={visibleSections.includes(projectThree.current)}
        index={3}
        title="Transformación digital end-to-end"
        description="Desde el diagnóstico hasta la implementación: modernizamos tu infraestructura tecnológica para competir en la economía digital."
        buttonText="Ver soluciones"
        buttonLink="/contact"
        model={{
          type: 'laptop',
          alt: 'Plataforma de transformación digital Neuralis',
          textures: [
            {
              srcSet: `https://res.cloudinary.com/lur7e7tw/image/upload/w_800/v1783901944/neuralis/neuralis/projects/digital-platform.jpg 800w, https://res.cloudinary.com/lur7e7tw/image/upload/w_1920/v1783901944/neuralis/neuralis/projects/digital-platform.jpg 1920w`,
              placeholder: `https://res.cloudinary.com/lur7e7tw/image/upload/w_20,e_blur:1000/v1783901944/neuralis/neuralis/projects/digital-platform.jpg`,
            },
          ],
        }}
      />
      <Profile
        sectionRef={details}
        visible={visibleSections.includes(details.current)}
        id="details"
      />
      <Footer />
    </div>
  );
};
