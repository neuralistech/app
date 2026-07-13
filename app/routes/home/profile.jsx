import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Heading } from '~/components/heading';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Link } from '~/components/link';
import { Transition } from '~/components/transition';
import { Fragment, useState } from 'react';
import styles from './profile.module.css';

const ProfileText = ({ visible, titleId }) => (
  <Fragment>
    <Heading className={styles.title} data-visible={visible} level={3} id={titleId}>
      <DecoderText text="Quiénes somos" start={visible} delay={500} />
    </Heading>
    <Text className={styles.description} data-visible={visible} size="l" as="p">
      Somos <strong>Neuralis</strong>, una empresa de tecnología especializada en
      transformación digital, BPO y operaciones de Call Center. Combinamos ingeniería de
      software con inteligencia artificial para convertir las operaciones de nuestros
      clientes en ventajas competitivas reales.
    </Text>
    <Text className={styles.description} data-visible={visible} size="l" as="p">
      Nuestro equipo diseña e implementa soluciones de automatización, infraestructura
      cloud e integración de sistemas que escalan con tu negocio. Si tienes un reto
      operacional o tecnológico,{' '}
      <Link href="/contact">hablemos</Link>.
    </Text>
  </Fragment>
);

export const Profile = ({ id, visible, sectionRef }) => {
  const [focused, setFocused] = useState(false);
  const titleId = `${id}-title`;

  return (
    <Section
      className={styles.profile}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <Transition in={visible || focused} timeout={0}>
        {({ visible, nodeRef }) => (
          <div className={styles.content} ref={nodeRef}>
            <div className={styles.column}>
              <ProfileText visible={visible} titleId={titleId} />
              <Button
                secondary
                className={styles.button}
                data-visible={visible}
                href="/contact"
                icon="send"
              >
                Contáctanos
              </Button>
            </div>
            <div className={styles.column}>
              <div className={styles.tag} aria-hidden>
                <Divider
                  notchWidth="64px"
                  notchHeight="8px"
                  collapsed={!visible}
                  collapseDelay={1000}
                />
                <div className={styles.tagText} data-visible={visible}>
                  Sobre Neuralis
                </div>
              </div>
              <div className={styles.image}>
                <div className={styles.imageWrapper} data-visible={visible}>
                  <svg
                    viewBox="0 0 400 300"
                    className={styles.placeholder}
                    style={{ width: '100%', height: 'auto', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}
                    aria-label="Neuralis Technologies"
                  >
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'oklch(0.62 0.25 250)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'oklch(0.45 0.20 280)', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#grad1)" rx="8" />
                    <text x="50%" y="45%" textAnchor="middle" fill="white" fontSize="48" fontWeight="bold" fontFamily="sans-serif">N</text>
                    <text x="50%" y="70%" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="18" fontFamily="sans-serif">Neuralis Technologies</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
};
